import { renderCard } from "../cards";
import type { CardKind, SigilProfile } from "../profile";
import { snapshotFromProfile } from "../snapshot";
import type { CardTheme } from "../themes";

export interface RenderCardOptions {
  kind: CardKind;
  profile: SigilProfile;
  theme: CardTheme;
  animate: boolean;
  params?: Record<string, string | undefined>;
  /** Defaults to the profile's `asOf`, so previews stay deterministic. */
  now?: string;
}

/**
 * Each card inlines a subset font, so rebuilding nine of them on a keystroke
 * or a hover is the expensive part of the studio. Identical inputs reuse the
 * previous document. Oldest entries drop first once the cap is hit.
 */
const SVG_CACHE_MAX = 72;
const SVG_CACHE = new Map<string, string>();

function resolvedNow(options: RenderCardOptions): string {
  const lastDay = options.profile.days?.[options.profile.days.length - 1]?.date;
  return options.now ?? options.profile.asOf ?? `${lastDay ?? "2026-01-01"}T12:00:00Z`;
}

/** Profile-shaped entry point used by routes and the studio. */
export function renderCardSvg(options: RenderCardOptions): string {
  const now = resolvedNow(options);
  const key = JSON.stringify({
    kind: options.kind,
    theme: options.theme,
    animate: options.animate,
    now,
    params: options.params ?? null,
    profile: options.profile,
  });
  const cached = SVG_CACHE.get(key);
  if (cached) {
    SVG_CACHE.delete(key);
    SVG_CACHE.set(key, cached);
    return cached;
  }

  const snapshot = snapshotFromProfile(options.profile);
  const svg = renderCard(options.kind, {
    snapshot,
    theme: options.theme,
    now,
    animate: options.animate,
    // The repo card needs ?repo=; profile-shaped callers default to the featured repo.
    params:
      options.kind === "repo" && !options.params?.["repo"]
        ? { ...options.params, repo: options.profile.repo.name }
        : (options.params ?? {}),
  });
  SVG_CACHE.set(key, svg);
  if (SVG_CACHE.size > SVG_CACHE_MAX) {
    const oldest = SVG_CACHE.keys().next().value;
    if (oldest !== undefined) SVG_CACHE.delete(oldest);
  }
  return svg;
}
