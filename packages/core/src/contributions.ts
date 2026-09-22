/**
 * Parse GitHub's public contribution calendar HTML.
 *
 * The page at `/users/:login/contributions` is a table of day cells
 * (`data-date`, `data-level`) plus a tooltip per cell with the real count.
 * No token required. Levels are 0..4; counts come from the tooltip text.
 */

export interface ContributionDay {
  date: string;
  level: number;
  count: number;
}

export interface ContributionCalendar {
  total: number;
  days: ContributionDay[];
}

export function parseContributionHtml(html: string): ContributionCalendar {
  const totalMatch = /([\d,]+)\s+contributions\s+in the last year/i.exec(html);
  const declared = totalMatch?.[1] ? Number(totalMatch[1].replaceAll(",", "")) : 0;

  const days: ContributionDay[] = [];
  const ids = new Map<string, ContributionDay>();
  const tdRe = /<td\b([^>]*)>/gi;
  let match: RegExpExecArray | null;
  while ((match = tdRe.exec(html))) {
    const attrs = match[1] ?? "";
    const date = /data-date="(\d{4}-\d{2}-\d{2})"/.exec(attrs)?.[1];
    const levelRaw = /data-level="(\d)"/.exec(attrs)?.[1];
    const id = /\bid="([^"]+)"/.exec(attrs)?.[1];
    if (!date || levelRaw === undefined) continue;
    const level = clampLevel(Number(levelRaw));
    const day: ContributionDay = { date, level, count: level === 0 ? 0 : level };
    days.push(day);
    if (id) ids.set(id, day);
  }

  const tipRe = /for="([^"]+)"[^>]*>\s*(No|[\d,]+)\s+contributions?\s+on/gi;
  while ((match = tipRe.exec(html))) {
    const id = match[1];
    const raw = match[2];
    if (!id || !raw) continue;
    const day = ids.get(id);
    if (!day) continue;
    day.count = raw.toLowerCase() === "no" ? 0 : Number(raw.replaceAll(",", "")) || 0;
    if (day.count === 0) day.level = 0;
  }

  const summed = days.reduce((sum, day) => sum + day.count, 0);
  return { total: declared || summed, days };
}

export interface Streak {
  current: number;
  best: number;
}

/** Current streak allows today to still be empty. Best is the longest run in `days`. */
export function streaks(days: ContributionDay[], today: string): Streak {
  const byDate = new Map(days.map((day) => [day.date, day.count]));
  const sorted = [...days].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  let best = 0;
  let run = 0;
  for (const day of sorted) {
    if (day.count > 0) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }

  let cursor = today;
  if ((byDate.get(cursor) ?? 0) <= 0) cursor = shiftDate(cursor, -1);

  let current = 0;
  while ((byDate.get(cursor) ?? 0) > 0) {
    current += 1;
    cursor = shiftDate(cursor, -1);
    if (current > 4000) break;
  }

  return { current, best: Math.max(best, current) };
}

export function shiftDate(isoDate: string, deltaDays: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}

/** Sunday (UTC) on or before `isoDate`. */
export function startOfWeek(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return shiftDate(isoDate, -date.getUTCDay());
}

/**
 * Column-major heatmap: index = week * 7 + weekday, oldest week first.
 * Days after `today` in the current week are zero.
 */
export function heatmapLevels(days: ContributionDay[], today: string, weeks: number): number[] {
  const byDate = new Map(days.map((day) => [day.date, clampLevel(day.level)]));
  const end = startOfWeek(today);
  const start = shiftDate(end, -(weeks - 1) * 7);
  const cells: number[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const date = shiftDate(start, i);
    cells.push(date > today ? 0 : (byDate.get(date) ?? 0));
  }
  return cells;
}

/** Weekly contribution sums, oldest week first, aligned to Sundays. */
export function weeklyCounts(days: ContributionDay[], today: string, weeks: number): number[] {
  const byDate = new Map(days.map((day) => [day.date, day.count]));
  const end = startOfWeek(today);
  const start = shiftDate(end, -(weeks - 1) * 7);
  const totals: number[] = [];
  for (let week = 0; week < weeks; week++) {
    let sum = 0;
    for (let day = 0; day < 7; day++) {
      const date = shiftDate(start, week * 7 + day);
      if (date > today) continue;
      sum += byDate.get(date) ?? 0;
    }
    totals.push(sum);
  }
  return totals;
}

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(4, Math.round(level)));
}
