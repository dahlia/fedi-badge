import { Collection, isActor, lookupObject } from "@fedify/fedify/vocab";
import { getNodeInfo } from "@fedify/fedify/nodeinfo";
import { makeBadge } from "badge-maker";
import { Hono } from "hono";
import { FALLBACK_LOGO, getLogo } from "./logos";

type Counter = "followers" | "following" | "posts";

type Bindings = { CACHE: KVNamespace };

interface BadgeInfo {
  num: number | null;
  actorHostname: string | null;
}

async function getBadgeInfo(
  kv: KVNamespace,
  handle: string,
  counter: Counter,
): Promise<BadgeInfo> {
  const countKey = `count:${handle}:${counter}`;
  const hostKey = `actor:${handle}:host`;

  const [cachedNum, cachedHost] = await Promise.all([
    kv.get<number>(countKey, { type: "json" }),
    kv.get(hostKey, { type: "text" }),
  ]);

  if (cachedNum != null && cachedHost !== null) {
    return { num: cachedNum, actorHostname: cachedHost === "" ? null : cachedHost };
  }

  let actor;
  try {
    actor = await lookupObject(handle);
  } catch (_) {
    return { num: cachedNum, actorHostname: null };
  }
  if (!isActor(actor)) return { num: cachedNum, actorHostname: null };

  const hostname = actor.id instanceof URL ? actor.id.hostname : null;

  const puts: Promise<void>[] = [];
  if (cachedHost === null) {
    puts.push(kv.put(hostKey, hostname ?? "", { expirationTtl: 3600 }));
  }

  let num = cachedNum;
  if (num == null) {
    let collection: Collection | null = null;
    try {
      collection = counter === "followers"
        ? await actor.getFollowers()
        : counter === "following"
        ? await actor.getFollowing()
        : await actor.getOutbox();
    } catch (_) {}
    num = collection?.totalItems ?? null;
    if (num != null) {
      puts.push(kv.put(countKey, String(num), { expirationTtl: 3600 }));
    }
  }

  await Promise.all(puts);
  return { num, actorHostname: hostname };
}

async function getSoftwareName(
  hostname: string,
  kv: KVNamespace,
): Promise<string | null> {
  const key = `nodeinfo:${hostname}`;
  const cached = await kv.get(key, { type: "text" });
  if (cached !== null) return cached === "" ? null : cached;
  let name: string | null = null;
  try {
    const info = await getNodeInfo(`https://${hostname}`, { parse: "best-effort" });
    name = info?.software?.name ?? null;
  } catch (_) {
    // NodeInfo unavailable; fall back to generic logo
  }
  await kv.put(key, name ?? "", { expirationTtl: 86400 });
  return name;
}

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.redirect("https://github.com/dahlia/fedi-badge"));

app.get(
  "/:handle{@[^@]+@[^@]+}/:counter{followers[.]svg|following[.]svg|posts[.]svg}",
  async (c) => {
    const { handle, counter } = c.req.param();
    const query = c.req.query();

    const counterType: Counter = counter === "followers.svg"
      ? "followers"
      : counter === "following.svg"
      ? "following"
      : "posts";

    const { num, actorHostname } = await getBadgeInfo(c.env.CACHE, handle, counterType);
    const softwareName = actorHostname != null
      ? await getSoftwareName(actorHostname, c.env.CACHE)
      : null;

    const style:
      | "plastic"
      | "flat"
      | "flat-square"
      | "for-the-badge"
      | "social" =
        ["plastic", "flat", "flat-square", "for-the-badge", "social"].includes(
            query.style,
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? query.style as any
          : "social";

    const svgText = softwareName != null ? getLogo(softwareName) : FALLBACK_LOGO;
    const svgBytes = new TextEncoder().encode(svgText);
    let binary = "";
    for (const byte of svgBytes) binary += String.fromCharCode(byte);
    const logoBase64 = `data:image/svg+xml;base64,${btoa(binary)}`;

    const svg = makeBadge({
      label: query.label == null ? handle : query.label,
      message: num?.toString() ?? "N/A",
      style,
      logoBase64,
    });

    return c.body(svg, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "image/svg+xml",
        "Last-Modified": new Date().toUTCString(),
        "Expires": new Date(Date.now() + 3600 * 1000).toUTCString(),
      },
    });
  },
);

export default app;
