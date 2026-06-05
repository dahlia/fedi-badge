import { Collection, isActor, lookupObject } from "@fedify/fedify/vocab";
import { makeBadge } from "badge-maker";
import { Hono } from "hono";

type Counter = "followers" | "following" | "posts";

type Bindings = { CACHE: KVNamespace };

async function count(
  kv: KVNamespace,
  handle: string,
  counter: Counter,
): Promise<number | null> {
  const key = `count:${handle}:${counter}`;
  const cached = await kv.get<number>(key, { type: "json" });
  if (cached != null) return cached;
  let actor;
  try {
    actor = await lookupObject(handle);
  } catch (_) {
    return null;
  }
  if (!isActor(actor)) return null;
  let collection: Collection | null = null;
  try {
    collection = counter == "followers"
      ? await actor.getFollowers()
      : counter == "following"
      ? await actor.getFollowing()
      : await actor.getOutbox();
  } catch (_) {
    return null;
  }
  const num = collection?.totalItems ?? null;
  if (num != null) {
    await kv.put(key, String(num), { expirationTtl: 3600 });
  }
  return num;
}

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.redirect("https://github.com/dahlia/fedi-badge"));

app.get(
  "/:handle{@[^@]+@[^@]+}/:counter{followers[.]svg|following[.]svg|posts[.]svg}",
  async (c) => {
    const { handle, counter } = c.req.param();
    const query = c.req.query();
    const num = await count(
      c.env.CACHE,
      handle,
      counter === "followers.svg"
        ? "followers"
        : counter === "following.svg"
        ? "following"
        : "posts",
    );
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
    const svg = makeBadge({
      label: query.label == null ? `Follow ${handle}` : query.label,
      message: num?.toString() ?? "N/A",
      style,
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
