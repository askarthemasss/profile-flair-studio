/**
 * Sigil's own rank estimate.
 *
 * GitHub does not publish a percentile. This maps a public score onto
 * "top N%" with a log curve: a few hundred points lands near the top quarter,
 * several thousand lands near the top few percent. It is an estimate, and the
 * JSON API labels it `sigil-estimate`.
 */
export function estimateRankPercent(input: {
  contributions: number;
  stars: number;
  followers: number;
  repos: number;
}): number {
  const score =
    Math.max(0, input.contributions) +
    Math.max(0, input.stars) * 4 +
    Math.max(0, input.followers) * 2 +
    Math.max(0, input.repos) * 0.5;
  const percent = Math.round(100 * Math.exp(-score / 3500));
  return Math.min(99, Math.max(1, percent));
}
