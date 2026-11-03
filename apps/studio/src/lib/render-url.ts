/**
 * Origin used wherever the studio shows a live URL to a user: embed snippets,
 * copy-Markdown, and the docs examples.
 *
 * `VITE_RENDER_API_URL` is the only source of truth, so the docs can never
 * advertise a host the project does not actually control. When it is unset the
 * placeholder is deliberately obvious rather than a plausible domain.
 */
import { ENV } from "./env.js";

const PLACEHOLDER_ORIGIN = "https://sigil-render.example.workers.dev";

export function renderOrigin(): string {
  return ENV.HAS_RENDER_API ? ENV.RENDER_API_URL : PLACEHOLDER_ORIGIN;
}

/** Same origin without the scheme, for compact labels. */
export function renderHost(): string {
  return renderOrigin().replace(/^https?:\/\//, "");
}
