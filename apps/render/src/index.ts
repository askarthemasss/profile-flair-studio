import { Hono } from "hono";
import { cors } from "hono/cors";
import { cardRoute, type RenderEnv } from "./routes/card.js";
import { snapshotRoute } from "./routes/snapshot.js";
import { themesRoute } from "./routes/themes.js";
import { healthRoute } from "./routes/health.js";
import { SupabaseRest } from "./db/supabase-rest.js";
import { TokenPool } from "./pipeline/token-pool.js";
import { getOrRefreshSnapshot } from "./pipeline/refresh-snapshot.js";

const app = new Hono<{ Bindings: RenderEnv }>();

// Enable CORS for studio SPA
app.use("*", cors());

// Mount routes
app.route("/", cardRoute);
app.route("/", snapshotRoute);
app.route("/", themesRoute);
app.route("/", healthRoute);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Endpoint not found", documentation: "https://sigil.dev/docs" }, 404);
});

// Scheduled cron handler for background refresh
async function scheduled(event: ScheduledEvent, env: RenderEnv, ctx: ExecutionContext) {
  console.log("Cron: background cache refresh tick at", new Date().toISOString());
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = new SupabaseRest({
        url: env.SUPABASE_URL,
        serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
      });
      const stale = await supabase.get<{ login: string }>(
        "snapshots",
        "select=login&order=fetched_at.asc&limit=5",
      );
      if (stale && stale.length > 0) {
        const tokenPool = new TokenPool(env.GITHUB_TOKEN_POOL ?? env.GITHUB_TOKEN);
        for (const row of stale) {
          ctx.waitUntil(
            getOrRefreshSnapshot({ login: row.login, tokenPool, supabase, forceRefresh: true }),
          );
        }
      }
    } catch (err) {
      console.error("Cron refresh error:", err);
    }
  }
}

export default {
  fetch: app.fetch,
  scheduled,
};
