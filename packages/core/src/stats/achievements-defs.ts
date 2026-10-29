import type {
  AchievementDef,
  AchievementState,
  AchievementTier,
  GithubSnapshot,
} from "../types.js";

const TIERS: AchievementTier[] = ["bronze", "silver", "gold", "obsidian"];

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "commit-marathoner",
    family: "volume",
    name: "Commit Marathoner",
    description: "Total lifetime commits",
    metric: (s) => s.totals.commits,
    thresholds: [500, 2_000, 8_000, 25_000],
  },
  {
    id: "streakkeeper",
    family: "consistency",
    name: "Streakkeeper",
    description: "Longest contribution streak in days",
    metric: (s) => s.streak.longest,
    thresholds: [14, 60, 180, 365],
  },
  {
    id: "pull-shark",
    family: "collaboration",
    name: "Pull Shark",
    description: "Pull requests opened",
    metric: (s) => s.totals.prsOpened,
    thresholds: [16, 128, 512, 1024],
  },
  {
    id: "code-reviewer",
    family: "collaboration",
    name: "Code Reviewer",
    description: "Pull request reviews submitted",
    metric: (s) => s.totals.reviews,
    thresholds: [10, 50, 200, 500],
  },
  {
    id: "starstruck",
    family: "impact",
    name: "Starstruck",
    description: "Stars earned across owned repos",
    metric: (s) => s.totals.starsEarned,
    thresholds: [16, 128, 512, 4096],
  },
  {
    id: "open-source-patron",
    family: "community",
    name: "Open Source Patron",
    description: "Repos contributed to (not owned)",
    metric: (s) => s.totals.contributedTo,
    thresholds: [5, 25, 100, 300],
  },
  {
    id: "polyglot",
    family: "range",
    name: "Polyglot",
    description: "Number of languages used across repos",
    metric: (s) => s.languages.length,
    thresholds: [3, 6, 10, 15],
  },
  {
    id: "networker",
    family: "community",
    name: "Networker",
    description: "GitHub followers",
    metric: (s) => s.followers,
    thresholds: [10, 100, 500, 2000],
  },
  {
    id: "galaxy-brain",
    family: "collaboration",
    name: "Galaxy Brain",
    description: "Discussion answers marked as helpful",
    metric: (s) => s.totals.discussionAnswers,
    thresholds: [2, 8, 16, 32],
  },
];

export function computeAchievements(s: GithubSnapshot): AchievementState[] {
  return ACHIEVEMENT_DEFS.map((def) => {
    const value = def.metric(s);
    let tier: AchievementTier | null = null;
    let nextAt: number | null = def.thresholds[0];

    for (let i = 0; i < TIERS.length; i++) {
      if (value >= def.thresholds[i]!) {
        tier = TIERS[i]!;
        nextAt = def.thresholds[i + 1] ?? null;
      }
    }

    return { id: def.id, tier, value, nextAt };
  });
}
