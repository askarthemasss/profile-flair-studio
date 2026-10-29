import type { StreakStats } from "../types.js";

interface Day {
  date: string;
  count: number;
}

/**
 * Compute streak statistics from an array of contribution days.
 * Days may be in any order — this function sorts them.
 * Pure — no I/O.
 */
export function computeStreak(days: Day[]): StreakStats {
  if (days.length === 0) {
    return {
      current: 0,
      currentStart: null,
      longest: 0,
      longestStart: null,
      longestEnd: null,
      totalContributions: 0,
      activeDays: 0,
      busiestDay: null,
    };
  }

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let totalContributions = 0;
  let activeDays = 0;
  let busiestDay: { date: string; count: number } | null = null;

  // Longest streak tracking
  let longest = 0;
  let longestStart: string | null = null;
  let longestEnd: string | null = null;
  let runLen = 0;
  let runStart: string | null = null;

  for (const day of sorted) {
    totalContributions += day.count;
    if (day.count > 0) {
      activeDays++;
      if (!busiestDay || day.count > busiestDay.count) {
        busiestDay = { date: day.date, count: day.count };
      }
      if (runLen === 0) runStart = day.date;
      runLen++;
      if (runLen > longest) {
        longest = runLen;
        longestStart = runStart;
        longestEnd = day.date;
      }
    } else {
      runLen = 0;
      runStart = null;
    }
  }

  // Current streak: most recent unbroken run ending today or yesterday
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  let current = 0;
  let currentStart: string | null = null;

  // Walk backwards
  let currentRunLen = 0;
  let currentRunStart: string | null = null;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const day = sorted[i]!;
    if (day.count > 0) {
      currentRunStart = day.date;
      currentRunLen++;
    } else {
      break;
    }
  }

  const lastDay = sorted[sorted.length - 1]!;
  if (currentRunLen > 0 && (lastDay.date === today || lastDay.date === yesterday)) {
    current = currentRunLen;
    currentStart = currentRunStart;
  }

  return {
    current,
    currentStart,
    longest,
    longestStart,
    longestEnd,
    totalContributions,
    activeDays,
    busiestDay,
  };
}
