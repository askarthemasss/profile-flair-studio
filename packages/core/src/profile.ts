/**
 * Shared card and profile shapes.
 *
 * The studio, the SVG renderer, and the public JSON API all speak this type.
 */

export const CARD_KIND_IDS = [
  "overview",
  "streak",
  "languages",
  "heatmap",
  "skyline",
  "activity",
  "achievements",
  "repo",
  "banner",
] as const;

export type CardKind = (typeof CARD_KIND_IDS)[number];

export function isCardKind(value: string): value is CardKind {
  return (CARD_KIND_IDS as readonly string[]).includes(value);
}

/** Card ids from older snippets keep working. */
const CARD_KIND_ALIASES: Record<string, CardKind> = { stats: "overview" };

export function resolveCardKind(value: string): CardKind | null {
  const id = value.trim().toLowerCase();
  return isCardKind(id) ? id : (CARD_KIND_ALIASES[id] ?? null);
}

/** GitHub logins: 1–39 chars, alphanumeric, hyphens not at either end. */
const USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function normalizeUsername(raw: string): string | null {
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    return null;
  }
  value = value.trim().replace(/^@/, "");
  if (!USERNAME.test(value)) return null;
  return value.toLowerCase();
}

export interface SigilProfile {
  username: string;
  name: string;
  bio: string;
  contributions: number;
  repos: number;
  stars: number;
  followers: number;
  /** Estimated "top N%" rank. See `estimateRankPercent`. */
  rankPercent: number;
  streakCurrent: number;
  streakBest: number;
  languages: { name: string; pct: number }[];
  /** 26 weeks × 7 days, column-major (week, then weekday). Intensity 0..4. */
  heatmap: number[];
  /** Weekly contribution counts, oldest first, 12 weeks. */
  activity: number[];
  achievements: { name: string; earned: boolean }[];
  repo: {
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
  };
  /** Richer fields the card catalog uses when the pipeline has them. */
  avatarDataUri?: string;
  commits?: number;
  prsMerged?: number;
  reviews?: number;
  issues?: number;
  /** Daily counts, oldest first. */
  days?: { date: string; count: number }[];
  languageBytes?: { name: string; bytes: number }[];
  topRepos?: {
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    pushedAt: string | null;
  }[];
  /** ISO time the data describes; default `now` for renders. */
  asOf?: string;
}

export const HEATMAP_WEEKS = 26;
export const HEATMAP_DAYS = 7;
export const HEATMAP_CELLS = HEATMAP_WEEKS * HEATMAP_DAYS;
export const ACTIVITY_WEEKS = 12;

export function emptySeries(): Pick<SigilProfile, "heatmap" | "activity"> {
  return {
    heatmap: Array.from({ length: HEATMAP_CELLS }, () => 0),
    activity: Array.from({ length: ACTIVITY_WEEKS }, () => 0),
  };
}
