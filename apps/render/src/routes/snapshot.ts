import { Hono } from "hono";
import type { ApiErrorBody } from "@sigil/core";
import { getOrRefreshSnapshot } from "../pipeline/refresh-snapshot.js";
import { getTokenPool } from "../pipeline/token-pool.js";
import { createEdgeSnapshotCache } from "../pipeline/edge-cache.js";
import type { RenderEnv } from "./card.js";

export const snapshotRoute = new Hono<{ Bindings: RenderEnv }>();

snapshotRoute.get("/snapshot/:username", async (c) => {
  const username = c.req.param("username");
  const force = c.req.query("force") === "1";

  const tokenPool = getTokenPool(c.env.GITHUB_TOKEN_POOL || c.env.GITHUB_TOKEN);
  const snapshotCache = createEdgeSnapshotCache(caches.default);

  const { snapshot, error, stale, revalidate } = await getOrRefreshSnapshot({
    login: username,
    tokenPool,
    cache: snapshotCache,
    forceRefresh: force,
  });

  // Serve the cached snapshot now; the refresh keeps running after the reply.
  if (revalidate) {
    c.executionCtx.waitUntil(revalidate);
  }

  if (error === "NOT_FOUND") {
    const body: ApiErrorBody = {
      code: "NOT_FOUND",
      message: "GitHub user not found",
    };
    return c.json(body, 404);
  }

  if (error === "UPSTREAM" || !snapshot) {
    const body: ApiErrorBody = {
      code: "UPSTREAM",
      message: "GitHub is temporarily unavailable, try again shortly",
    };
    return c.json(body, 503, { "Retry-After": "60" });
  }

  return c.json(snapshot, 200, {
    // Same reasoning as the card route: a stale body may belong to a deleted
    // account, so do not let any cache outlive the refresh that evicts it.
    "Cache-Control": stale ? "no-store" : "public, max-age=1800, stale-while-revalidate=86400",
    ...(stale ? { "X-Sigil-Stale": "1" } : {}),
  });
});
