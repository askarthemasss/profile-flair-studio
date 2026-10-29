import { Hono } from "hono";
import {
  CARD_IDS,
  CARD_RENDERERS,
  CommonParamsSchema,
  resolveTheme,
  type CardId,
} from "@sigil/core";
import { getOrRefreshSnapshot } from "../pipeline/refresh-snapshot.js";
import { TokenPool } from "../pipeline/token-pool.js";
import { SupabaseRest } from "../db/supabase-rest.js";

export interface RenderEnv {
  GITHUB_TOKEN?: string;
  GITHUB_TOKEN_POOL?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  ENVIRONMENT?: string;
}

export const cardRoute = new Hono<{ Bindings: RenderEnv }>();

cardRoute.get("/c/:kind/:username", async (c) => {
  const kindParam = c.req.param("kind") as CardId;
  const username = c.req.param("username");

  if (!CARD_IDS.includes(kindParam)) {
    return c.json({ error: "Unknown card kind", valid: CARD_IDS }, 400);
  }

  // Parse query params using CommonParamsSchema
  const searchParams = Object.fromEntries(new URL(c.req.url).searchParams);
  const parsedParams = CommonParamsSchema.safeParse({
    user: username,
    ...searchParams,
  });

  if (!parsedParams.success) {
    return c.json({ error: "Invalid query params", issues: parsedParams.error.issues }, 400);
  }

  // --- Check Cloudflare Workers Cache API ---
  const cache = caches.default;
  const cacheKey = new Request(c.req.url);
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  // --- Prepare Token Pool & Supabase ---
  const tokenPool = new TokenPool(c.env.GITHUB_TOKEN_POOL || c.env.GITHUB_TOKEN);
  const supabase =
    c.env.SUPABASE_URL && (c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY)
      ? new SupabaseRest({
          url: c.env.SUPABASE_URL,
          serviceKey: c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY!,
        })
      : undefined;

  // --- Retrieve Snapshot ---
  const { snapshot, error } = await getOrRefreshSnapshot({
    login: username,
    tokenPool,
    supabase,
  });

  if (error || !snapshot) {
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80"><rect width="100%" height="100%" fill="#121115"/><text x="20" y="45" fill="#f87171" font-family="monospace" font-size="12">User not found on GitHub</text></svg>`,
      { status: 404, headers: { "Content-Type": "image/svg+xml" } },
    );
  }

  // --- Resolve Theme with Hex Overrides ---
  const overrides: Record<string, string> = {};
  if (parsedParams.data.bg) overrides.bg = `#${parsedParams.data.bg}`;
  if (parsedParams.data.text) overrides.text = `#${parsedParams.data.text}`;
  if (parsedParams.data.accent) overrides.accent = `#${parsedParams.data.accent}`;

  const theme = resolveTheme(parsedParams.data.theme, overrides as any);

  // --- Render SVG via pure string operations (< 10ms CPU budget) ---
  const renderer = CARD_RENDERERS[kindParam];
  const svg = renderer({
    snapshot,
    theme,
    params: {
      ...parsedParams.data,
      ...searchParams,
    },
    now: new Date(),
  });

  const response = new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      "X-Sigil-Kind": kindParam,
      "X-Sigil-Theme": theme.id,
      "X-Sigil-Mode": theme.mode,
    },
  });

  // Asynchronously store in Cloudflare Edge cache
  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
});
