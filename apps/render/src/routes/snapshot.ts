import { Hono } from "hono";
import type { ApiErrorBody } from "@sigil/core";
import { getOrRefreshSnapshot } from "../pipeline/refresh-snapshot.js";
import { TokenPool } from "../pipeline/token-pool.js";
import { SupabaseRest } from "../db/supabase-rest.js";
import type { RenderEnv } from "./card.js";

export const snapshotRoute = new Hono<{ Bindings: RenderEnv }>();

snapshotRoute.get("/snapshot/:username", async (c) => {
  const username = c.req.param("username");
  const force = c.req.query("force") === "1";

  const tokenPool = new TokenPool(c.env.GITHUB_TOKEN_POOL || c.env.GITHUB_TOKEN);
  const supabase =
    c.env.SUPABASE_URL && (c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY)
      ? new SupabaseRest({
          url: c.env.SUPABASE_URL,
          serviceKey: c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY!,
        })
      : undefined;

  const { snapshot, error } = await getOrRefreshSnapshot({
    login: username,
    tokenPool,
    supabase,
    forceRefresh: force,
  });

  if (error === "OPTED_OUT") {
    const body: ApiErrorBody = {
      code: "OPTED_OUT",
      message: "User opted out of Sigil telemetry",
    };
    return c.json(body, 403);
  }

  if (error || !snapshot) {
    const body: ApiErrorBody = {
      code: error ?? "NOT_FOUND",
      message: "Failed to fetch GitHub snapshot for user",
    };
    return c.json(body, 404);
  }

  return c.json(snapshot, 200, {
    "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
  });
});
