/**
 * Build-time configuration.
 *
 * `VITE_RENDER_API_URL` points at the deployed render Worker (for example
 * `https://sigil-render.<account>.workers.dev`). It is intentionally not
 * defaulted to a public host: without it the studio runs on demo data instead
 * of waiting on a DNS lookup that will never resolve.
 */
const renderApiUrl = (import.meta.env.VITE_RENDER_API_URL ?? "").replace(/\/$/, "");

export const ENV = {
  RENDER_API_URL: renderApiUrl,
  /** True when a render Worker is configured for this build. */
  HAS_RENDER_API: renderApiUrl.length > 0,
} as const;
