/**
 * Build-time configuration.
 *
 * `VITE_RENDER_API_URL` points at the deployed render Worker (for example
 * `https://sigil-render.<account>.workers.dev`). It is intentionally not
 * defaulted to a public host: without it the studio leans on the browser-side
 * GitHub fetch (`services/github-rest.ts`) instead of waiting on a DNS lookup
 * that will never resolve. Prefer the Worker when set — one request, server
 * token pool, 4 hour freshness.
 */
const renderApiUrl = (import.meta.env.VITE_RENDER_API_URL ?? "").replace(/\/$/, "");

export const ENV = {
  RENDER_API_URL: renderApiUrl,
  /** True when a render Worker is configured for this build. */
  HAS_RENDER_API: renderApiUrl.length > 0,
} as const;
