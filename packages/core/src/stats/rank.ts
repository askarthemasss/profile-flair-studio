/**
 * Sigil rank: log-scaled, weighted, transparent.
 * n = min(1, log10(1 + x) / log10(1 + ceiling)); score = 100 * Σ weight · n.
 * All constants live here. Tune after seeing real distributions.
 */
export const RANK = {
  metrics: {
    commits: { weight: 0.2, ceiling: 15_000 },
    prsMerged: { weight: 0.2, ceiling: 1_500 },
    stars: { weight: 0.2, ceiling: 20_000 },
    reviews: { weight: 0.15, ceiling: 1_000 },
    followers: { weight: 0.1, ceiling: 10_000 },
    issues: { weight: 0.05, ceiling: 500 },
    contributedTo: { weight: 0.05, ceiling: 200 },
    longestStreak: { weight: 0.05, ceiling: 365 },
  },
  tiers: [
    { tier: "initiate", min: 0 },
    { tier: "apprentice", min: 10 },
    { tier: "journeyman", min: 20 },
    { tier: "adept", min: 30 },
    { tier: "artisan", min: 40 },
    { tier: "virtuoso", min: 50 },
    { tier: "master", min: 60 },
    { tier: "grandmaster", min: 70 },
    { tier: "legend", min: 85 },
  ],
} as const;

export type RankMetric = keyof typeof RANK.metrics;
export type RankTier = (typeof RANK.tiers)[number]["tier"];
export type RankInput = Record<RankMetric, number>;

export function normalizeMetric(x: number, ceiling: number): number {
  const v = Math.max(0, Number.isFinite(x) ? x : 0);
  return Math.min(1, Math.log10(1 + v) / Math.log10(1 + ceiling));
}

export function computeRank(input: RankInput): {
  score: number;
  tier: RankTier;
  breakdown: Record<RankMetric, number>;
} {
  const breakdown = {} as Record<RankMetric, number>;
  let score = 0;
  for (const key of Object.keys(RANK.metrics) as RankMetric[]) {
    const { weight, ceiling } = RANK.metrics[key];
    const part = 100 * weight * normalizeMetric(input[key], ceiling);
    breakdown[key] = part;
    score += part;
  }
  score = Math.round(score * 10) / 10;
  return { score, tier: tierFor(score), breakdown };
}

export function tierFor(score: number): RankTier {
  let tier: RankTier = "initiate";
  for (const t of RANK.tiers) if (score >= t.min) tier = t.tier;
  return tier;
}
