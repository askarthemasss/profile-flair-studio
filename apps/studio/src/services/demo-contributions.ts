const DAY_MS = 86_400_000;

export interface DemoContributions {
  /** Contribution counts indexed by day of year (0 = Jan 1). */
  days: number[];
  total: number;
  activeDays: number;
  current: number;
  currentStart: string;
  longest: number;
  longestStart: string;
  longestEnd: string;
  busiestDay: { date: string; count: number };
}

/**
 * Builds the demo contribution year and the streak statistics derived from it.
 *
 * Days are indexed by day of the current year, matching how the heatmap card
 * reads `years[].days`. Future days stay empty and a short streak is kept alive
 * through `now`, so the demo's "current streak" never looks expired.
 */
export function buildDemoContributions(now: Date): DemoContributions {
  const year = now.getUTCFullYear();
  const yearStart = Date.UTC(year, 0, 1);
  const daysInYear = Math.floor((Date.UTC(year + 1, 0, 1) - yearStart) / DAY_MS);
  const dayOfYear = Math.min(Math.floor((now.getTime() - yearStart) / DAY_MS) + 1, daysInYear);

  const days: number[] = Array.from({ length: daysInYear }, (_, i) => {
    // Future days in the year have not happened yet
    if (i >= dayOfYear) return 0;
    // Generate a realistic contribution cadence
    const weekday = i % 7;
    if (weekday === 0 || weekday === 6)
      return Math.random() > 0.6 ? Math.floor(Math.random() * 4) : 0;
    return Math.random() > 0.2 ? Math.floor(Math.random() * 8) + 1 : 0;
  });

  // Keep a streak alive through today so the demo's current streak matches
  // its `fetchedAt` timestamp instead of expiring.
  for (let i = Math.max(0, dayOfYear - 12); i < dayOfYear; i++) {
    if (days[i] === 0) days[i] = 1 + (i % 3);
  }

  const dateAt = (index: number) => new Date(yearStart + index * DAY_MS).toISOString();

  let run = 0;
  let longest = 0;
  let longestEnd = 0;
  let busiestIndex = 0;
  for (let i = 0; i < dayOfYear; i++) {
    const count = days[i] ?? 0;
    if (count > 0) {
      run++;
      if (run > longest) {
        longest = run;
        longestEnd = i;
      }
    } else {
      run = 0;
    }
    if (count > (days[busiestIndex] ?? 0)) busiestIndex = i;
  }

  return {
    days,
    total: days.reduce((a, b) => a + b, 0),
    activeDays: days.filter((d) => d > 0).length,
    current: run,
    currentStart: dateAt(dayOfYear - run),
    longest,
    longestStart: dateAt(longestEnd - longest + 1),
    longestEnd: dateAt(longestEnd),
    busiestDay: {
      date: dateAt(busiestIndex).slice(0, 10),
      count: days[busiestIndex] ?? 0,
    },
  };
}
