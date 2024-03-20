import { Collection, isActor, lookupObject } from "@fedify/fedify";
import { makeBadge } from "badge-maker";
import { Hono } from "hono";

type Counter = "followers" | "following" | "posts";

const kv = await Deno.openKv();

async function count(handle: string, counter: Counter): Promise<number | null> {
  const cached = await kv.get<number | null>(["count", handle, counter]);
  if (cached != null && cached.value != null) return cached.value;
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
  await kv.set(["count", handle, counter], num, { expireIn: 60 * 60 * 1000 });
  return num;
}

const app = new Hono();

app.get("/", (c) => c.redirect("https://github.com/dahlia/fedi-badge"));

app.get(
  "/:handle{@[^@]+@[^@]+}/:counter{followers[.]svg|following[.]svg|posts[.]svg}",
  async (c) => {
    const { handle, counter } = c.req.param();
    const query = c.req.query();
    const num = await count(
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
          // deno-lint-ignore no-explicit-any
          ? query.style as unknown as any
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

if (import.meta.main) {
  Deno.serve(app.fetch);
}
