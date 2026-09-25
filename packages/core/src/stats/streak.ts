import type { ContributionYear, StreakStats } from "../github/types";

function iso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Walk days oldest → newest. "Today" is the UTC date. If today has zero
 * contributions, the current streak is still alive through yesterday (grace).
 */
export function computeStreak(years: ContributionYear[], now: Date): StreakStats {
  const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const counts = new Map<number, number>();
  for (const y of years) {
    const jan1 = Date.UTC(y.year, 0, 1);
    y.days.forEach((c, i) => counts.set(jan1 + i * 86_400_000, c));
  }
  const dates = [...counts.keys()].filter((d) => d <= todayMs).sort((a, b) => a - b);

  let longest = 0, longestStart: number | null = null, longestEnd: number | null = null;
  let run = 0, runStart = 0, prev = Number.NaN, activeDays = 0;
  for (const d of dates) {
    const c = counts.get(d) ?? 0;
    if (c > 0) {
      activeDays++;
      if (run > 0 && d - prev === 86_400_000) run++;
      else { run = 1; runStart = d; }
      if (run > longest) { longest = run; longestStart = runStart; longestEnd = d; }
    } else run = 0;
    prev = d;
  }

  let cursor = todayMs;
  if ((counts.get(cursor) ?? 0) === 0) cursor -= 86_400_000;
  let current = 0;
  while ((counts.get(cursor) ?? 0) > 0) { current++; cursor -= 86_400_000; }

  return {
    current,
    longest,
    activeDays,
    currentStart: current > 0 ? iso(cursor + 86_400_000) : null,
    longestStart: longestStart === null ? null : iso(longestStart),
    longestEnd: longestEnd === null ? null : iso(longestEnd),
  };
}
