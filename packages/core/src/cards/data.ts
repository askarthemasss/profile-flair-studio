/** Pure date/series helpers shared by the calendar-shaped cards. */

const DAY = 86_400_000;

export function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function dayMs(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

export function countsByDate(days: { date: string; count: number }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const day of days) map.set(day.date, Math.max(0, day.count || 0));
  return map;
}

/** Counts for the `length` days ending on `end` (inclusive), oldest first. */
export function dailySeries(
  days: { date: string; count: number }[],
  end: string,
  length: number,
): { date: string; count: number }[] {
  const map = countsByDate(days);
  const last = dayMs(end);
  return Array.from({ length }, (_, i) => {
    const date = isoDay(last - (length - 1 - i) * DAY);
    return { date, count: map.get(date) ?? 0 };
  });
}

/** Levels 0..4 by quartile of non-zero counts. */
export function levelScale(counts: number[]): (count: number) => number {
  const sorted = counts.filter((c) => c > 0).sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.floor((sorted.length - 1) * p)] ?? 0;
  const [a, b, c] = [q(0.25), q(0.5), q(0.75)];
  return (count) => (count <= 0 ? 0 : count <= a ? 1 : count <= b ? 2 : count <= c ? 3 : 4);
}

export interface Run {
  length: number;
  start: string;
  end: string;
}

/** Current streak (alive if today or yesterday counted) and longest run. */
export function streakRuns(
  days: { date: string; count: number }[],
  today: string,
): { current: Run; longest: Run } {
  const active = [...countsByDate(days).entries()]
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort();
  const empty: Run = { length: 0, start: today, end: today };
  let longest = empty;
  let run: Run | null = null;
  for (const date of active) {
    if (run && dayMs(date) - dayMs(run.end) === DAY) run = { ...run, end: date, length: run.length + 1 };
    else run = { length: 1, start: date, end: date };
    if (run.length > longest.length) longest = run;
  }
  const gap = run ? (dayMs(today) - dayMs(run.end)) / DAY : Infinity;
  return { current: run && gap <= 1 ? run : empty, longest };
}

export const DAY_MS = DAY;
