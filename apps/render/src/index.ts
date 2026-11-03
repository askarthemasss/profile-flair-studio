import { Hono } from "hono";
import { cors } from "hono/cors";
import { cardRoute, type RenderEnv } from "./routes/card.js";
import { snapshotRoute } from "./routes/snapshot.js";
import { themesRoute } from "./routes/themes.js";
import { healthRoute } from "./routes/health.js";
import { API_VERSION } from "./version.js";

const app = new Hono<{ Bindings: RenderEnv }>();

// Enable CORS for the studio SPA. Custom headers must be exposed explicitly or
// browser clients cannot read them from `fetch()`.
app.use(
  "*",
  cors({
    exposeHeaders: [
      "X-Sigil-Api-Version",
      "X-Sigil-Kind",
      "X-Sigil-Theme",
      "X-Sigil-Mode",
      "X-Sigil-Stale",
      "Retry-After",
    ],
  }),
);

// Every response advertises the API version so clients can pin against it.
app.use("*", async (c, next) => {
  await next();
  c.header("X-Sigil-Api-Version", API_VERSION);
});

// Mount routes. `/v1` is the stable surface; the unversioned paths are kept as
// aliases so existing embeds keep working.
app.route("/", cardRoute);
app.route("/", snapshotRoute);
app.route("/", themesRoute);
app.route("/", healthRoute);
app.route("/v1", cardRoute);
app.route("/v1", snapshotRoute);
app.route("/v1", themesRoute);
app.route("/v1", healthRoute);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Endpoint not found",
      documentation:
        "https://github.com/askarthemasss/profile-flair-studio/blob/main/apps/render/README.md",
    },
    404,
  );
});

// No database and no cron: snapshots live in the per-colo edge cache and are
// refreshed on demand by stale-while-revalidate.
export default {
  fetch: app.fetch,
};
