import type { GithubSnapshot, RankResult, RankTier } from "../types.js";

const TIERS: RankTier[] = [
  "initiate",
  "apprentice",
  "journeyman",
  "adept",
  "artisan",
  "virtuoso",
  "master",
  "grandmaster",
  "legend",
];

/** Score thresholds (0–1) to reach each tier */
const TIER_THRESHOLDS: Record<RankTier, number> = {
  initiate: 0,
  apprentice: 0.08,
  journeyman: 0.18,
  adept: 0.3,
  artisan: 0.44,
  virtuoso: 0.58,
  master: 0.72,
  grandmaster: 0.86,
  legend: 0.96,
};

const WEIGHTS = {
  commits: 0.25,
  starsEarned: 0.2,
  prsOpened: 0.15,
  followers: 0.1,
  reviews: 0.1,
  issues: 0.08,
  streak: 0.07,
  ownedRepos: 0.05,
} as const;

const CAPS = {
  commits: 15_000,
  starsEarned: 10_000,
  prsOpened: 1_000,
  followers: 5_000,
  reviews: 500,
  issues: 500,
  streak: 365,
  ownedRepos: 200,
} as const;

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function computeRank(s: GithubSnapshot): RankResult {
  const raw = {
    commits: s.totals.commits,
    starsEarned: s.totals.starsEarned,
    prsOpened: s.totals.prsOpened,
    followers: s.followers,
    reviews: s.totals.reviews,
    issues: s.totals.issues,
    streak: s.streak.longest,
    ownedRepos: s.totals.ownedRepos,
  };

  const score = (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).reduce((acc, key) => {
    const value = Math.min(raw[key], CAPS[key]);
    return acc + WEIGHTS[key] * (value / CAPS[key]);
  }, 0);

  // Sigmoid-stretch to spread the middle range
  const stretched = sigmoid((score - 0.3) * 8);

  let tier: RankTier = "initiate";
  let nextTier: RankTier | null = null;

  for (let i = TIERS.length - 1; i >= 0; i--) {
    const t = TIERS[i]!;
    if (stretched >= TIER_THRESHOLDS[t]) {
      tier = t;
      nextTier = TIERS[i + 1] ?? null;
      break;
    }
  }

  const toNext = nextTier ? Math.max(0, TIER_THRESHOLDS[nextTier] - stretched) : 0;

  return { score: stretched, tier, nextTier, toNext };
}
