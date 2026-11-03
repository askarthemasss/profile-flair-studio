import { Hono } from "hono";
import {
  CARD_IDS,
  CARD_PARAM_SCHEMAS,
  CARD_RENDERERS,
  resolveTheme,
  type CardId,
  type Theme,
} from "@sigil/core";
import { getOrRefreshSnapshot } from "../pipeline/refresh-snapshot.js";
import { getTokenPool } from "../pipeline/token-pool.js";
import { createEdgeSnapshotCache, getDefaultCache } from "../pipeline/edge-cache.js";

export interface RenderEnv {
  GITHUB_TOKEN?: string;
  GITHUB_TOKEN_POOL?: string;
  ENVIRONMENT?: string;
}

export const cardRoute = new Hono<{ Bindings: RenderEnv }>();

function errorCard(
  message: string,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80"><rect width="100%" height="100%" fill="#121115"/><text x="20" y="45" fill="#f87171" font-family="monospace" font-size="12">${message}</text></svg>`,
    {
      status,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store",
        ...headers,
      },
    },
  );
}

cardRoute.get("/c/:kind/:username", async (c) => {
  const kindParam = c.req.param("kind") as CardId;
  const username = c.req.param("username");

  if (!CARD_IDS.includes(kindParam)) {
    return c.json({ error: "Unknown card kind", valid: CARD_IDS }, 400);
  }

  // Parse query params with the schema for this card kind, so defaults and
  // coercions (weeks, cols, hide lists) apply before rendering.
  const searchParams = Object.fromEntries(new URL(c.req.url).searchParams);
  const parsedParams = CARD_PARAM_SCHEMAS[kindParam].safeParse({
    user: username,
    ...searchParams,
  });

  if (!parsedParams.success) {
    return c.json({ error: "Invalid query params", issues: parsedParams.error.issues }, 400);
  }

  // --- Check the colo-local Cloudflare Cache API ---
  // `undefined` on `*.workers.dev`, where Cache API operations are no-ops. The
  // snapshot cache still works there through its in-isolate layer.
  const cache = getDefaultCache();
  const cacheKey = new Request(c.req.url);
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // --- Prepare Token Pool & edge snapshot cache ---
  const tokenPool = getTokenPool(c.env.GITHUB_TOKEN_POOL || c.env.GITHUB_TOKEN);
  const snapshotCache = createEdgeSnapshotCache(cache);

  // --- Retrieve Snapshot ---
  const { snapshot, error, stale, revalidate } = await getOrRefreshSnapshot({
    login: username,
    tokenPool,
    cache: snapshotCache,
  });

  // A stale snapshot is already served; keep the isolate alive so the refresh
  // can finish and land in the edge cache.
  if (revalidate) {
    c.executionCtx.waitUntil(revalidate);
  }

  if (error === "NOT_FOUND") {
    return errorCard("User not found on GitHub", 404);
  }

  // Missing snapshot without a NOT_FOUND answer means GitHub was unreachable or
  // out of quota. Report it as transient instead of pretending the user is gone.
  if (error === "UPSTREAM" || !snapshot) {
    return errorCard("GitHub is temporarily unavailable", 503, { "Retry-After": "60" });
  }

  // --- Resolve Theme with Hex Overrides ---
  const overrides: Partial<Theme["colors"]> = {};
  if (parsedParams.data.bg) overrides.bg = `#${parsedParams.data.bg}`;
  if (parsedParams.data.text) overrides.text = `#${parsedParams.data.text}`;
  if (parsedParams.data.accent) overrides.accent = `#${parsedParams.data.accent}`;

  const theme = resolveTheme(parsedParams.data.theme, overrides);

  // --- Render SVG via pure string operations (< 10ms CPU budget) ---
  const renderer = CARD_RENDERERS[kindParam];
  const svg = renderer({
    snapshot,
    theme,
    params: parsedParams.data,
    now: new Date(),
  });

  const response = new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // A stale render may belong to a since-deleted account, and the refresh
      // that evicts it runs after this response. Keep it out of every cache so
      // the eviction takes effect on the next request instead of in five
      // minutes.
      "Cache-Control": stale ? "no-store" : "public, s-maxage=300, stale-while-revalidate=86400",
      "X-Sigil-Kind": kindParam,
      "X-Sigil-Theme": theme.id,
      "X-Sigil-Mode": theme.mode,
      ...(stale ? { "X-Sigil-Stale": "1" } : {}),
    },
  });

  // Asynchronously store in the Cloudflare cache. Stale renders are skipped for
  // the same reason as the header above, and the Cache API is skipped entirely
  // where it is a no-op (`*.workers.dev`).
  if (!stale && cache) {
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
});
