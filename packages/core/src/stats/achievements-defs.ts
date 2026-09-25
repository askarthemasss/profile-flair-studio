import type { GithubSnapshot } from "../github/types";

export const ACHIEVEMENT_TIERS = ["bronze", "silver", "gold", "obsidian"] as const;
export type AchievementTier = (typeof ACHIEVEMENT_TIERS)[number];

export interface AchievementDef {
  id: string;
  family: "Consistency" | "Volume" | "Collaboration" | "Impact" | "Range" | "Community";
  name: string;
  metric: string;
  thresholds: readonly [number, number, number, number];
  value: (s: GithubSnapshot) => number;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: "unbroken", family: "Consistency", name: "Unbroken", metric: "Longest streak", thresholds: [7, 30, 100, 365], value: (s) => s.streak.longest },
  { id: "regular", family: "Consistency", name: "Regular", metric: "Active days", thresholds: [50, 200, 500, 1500], value: (s) => s.streak.activeDays },
  { id: "committer", family: "Volume", name: "Committer", metric: "Commits", thresholds: [100, 1000, 5000, 15000], value: (s) => s.counts.commits },
  { id: "merger", family: "Collaboration", name: "Merger", metric: "PRs merged", thresholds: [10, 100, 500, 1500], value: (s) => s.counts.prsMerged },
  { id: "reviewer", family: "Collaboration", name: "Reviewer", metric: "Reviews", thresholds: [10, 100, 400, 1000], value: (s) => s.counts.reviews },
  { id: "starlit", family: "Impact", name: "Starlit", metric: "Stars earned", thresholds: [10, 100, 1000, 10000], value: (s) => s.counts.stars },
  { id: "polyglot", family: "Range", name: "Polyglot", metric: "Languages used", thresholds: [3, 5, 8, 12], value: (s) => s.languages.length },
  { id: "followed", family: "Community", name: "Followed", metric: "Followers", thresholds: [10, 100, 1000, 10000], value: (s) => s.counts.followers },
];

/**
 * GitHub exposes no API for its own achievements. These are estimates from
 * derivable data only and must be labelled "approx." wherever shown.
 * YOLO, Quickdraw and Pair Extraordinaire are intentionally not attempted.
 */
export const ESTIMATED_GITHUB_BADGES: readonly (Omit<AchievementDef, "family"> & { approx: true })[] = [
  { id: "pull-shark", name: "Pull Shark", metric: "Merged PRs", thresholds: [2, 16, 128, 1024], value: (s) => s.counts.prsMerged, approx: true },
  { id: "galaxy-brain", name: "Galaxy Brain", metric: "Accepted answers", thresholds: [2, 8, 16, 32], value: (s) => s.counts.discussionAnswers, approx: true },
  { id: "starstruck", name: "Starstruck", metric: "Stars on one repo", thresholds: [16, 128, 512, 4096], value: (s) => s.maxRepoStars, approx: true },
];

export interface AchievementResult {
  id: string;
  name: string;
  metric: string;
  value: number;
  tier: AchievementTier | null;
  next: number | null;
  approx: boolean;
}

export function tierForValue(value: number, t: readonly number[]): AchievementTier | null {
  let tier: AchievementTier | null = null;
  t.forEach((min, i) => { if (value >= min) tier = ACHIEVEMENT_TIERS[i]!; });
  return tier;
}

export function evaluateAchievements(s: GithubSnapshot): AchievementResult[] {
  const run = (d: Omit<AchievementDef, "family">, approx: boolean): AchievementResult => {
    const value = d.value(s);
    return {
      id: d.id,
      name: approx ? `${d.name} (approx.)` : d.name,
      metric: d.metric,
      value,
      tier: tierForValue(value, d.thresholds),
      next: d.thresholds.find((t) => value < t) ?? null,
      approx,
    };
  };
  return [...ACHIEVEMENTS.map((d) => run(d, false)), ...ESTIMATED_GITHUB_BADGES.map((d) => run(d, true))];
}
