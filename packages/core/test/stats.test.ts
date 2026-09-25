import { describe, expect, test } from "bun:test";
import { RANK, computeRank, normalizeMetric, tierFor } from "../src/stats/rank";
import { computeStreak } from "../src/stats/streak";
import { aggregateLanguages } from "../src/stats/languages";
import { tierForValue } from "../src/stats/achievements-defs";
import { calendarToYear } from "../src/github/fetch-snapshot";

const zero = { commits: 0, prsMerged: 0, stars: 0, reviews: 0, followers: 0, issues: 0, contributedTo: 0, longestStreak: 0 };

describe("rank", () => {
  test("weights sum to 1", () => {
    const sum = Object.values(RANK.metrics).reduce((s, m) => s + m.weight, 0);
    expect(sum).toBeCloseTo(1, 10);
  });
  test("zero is initiate, ceilings are legend 100", () => {
    expect(computeRank(zero)).toMatchObject({ score: 0, tier: "initiate" });
    const maxed = Object.fromEntries(Object.entries(RANK.metrics).map(([k, m]) => [k, m.ceiling * 10])) as typeof zero;
    expect(computeRank(maxed)).toMatchObject({ score: 100, tier: "legend" });
  });
  test("normalize is log-scaled and capped", () => {
    expect(normalizeMetric(15_000, 15_000)).toBe(1);
    expect(normalizeMetric(-5, 10)).toBe(0);
    expect(normalizeMetric(99, 9999)).toBeCloseTo(0.5, 3);
  });
  test("tier thresholds", () => {
    expect(tierFor(9.9)).toBe("initiate");
    expect(tierFor(10)).toBe("apprentice");
    expect(tierFor(84.9)).toBe("grandmaster");
    expect(tierFor(85)).toBe("legend");
  });
});

describe("streak", () => {
  const year = (y: number, days: number[]) => ({ year: y, total: 0, days, fetchedAt: "" });
  test("grace: empty today keeps streak alive through yesterday", () => {
    const now = new Date("2026-01-05T10:00:00Z");
    const s = computeStreak([year(2026, [1, 1, 1, 1, 0])], now);
    expect(s.current).toBe(4);
    expect(s.longest).toBe(4);
    expect(s.activeDays).toBe(4);
  });
  test("streak spans year boundary", () => {
    const d2025 = Array(365).fill(0);
    d2025[363] = 2; d2025[364] = 3;
    const s = computeStreak([year(2025, d2025), year(2026, [1, 1])], new Date("2026-01-02T23:00:00Z"));
    expect(s.current).toBe(4);
    expect(s.currentStart).toBe("2025-12-30");
  });
  test("gap of two days breaks it", () => {
    const s = computeStreak([year(2026, [1, 1, 0, 0, 0])], new Date("2026-01-05T00:00:00Z"));
    expect(s.current).toBe(0);
    expect(s.longest).toBe(2);
  });
});

describe("languages", () => {
  const repo = (archived: boolean, langs: [string, number][]) => ({
    name: "a/b", description: "", stars: 0, forks: 0, archived, pushedAt: null, language: null, languageColor: null,
    languages: langs.map(([name, bytes]) => ({ name, color: null, bytes })),
  });
  const repos = [repo(false, [["TS", 300], ["Go", 100]]), repo(true, [["Go", 600]])];
  test("sums bytes including archived by default", () => {
    expect(aggregateLanguages(repos)[0]).toMatchObject({ name: "Go", bytes: 700 });
  });
  test("hideArchived excludes archived", () => {
    const l = aggregateLanguages(repos, { hideArchived: true });
    expect(l[0]).toMatchObject({ name: "TS", pct: 75 });
  });
});

test("achievement tiers", () => {
  expect(tierForValue(6, [7, 30, 100, 365])).toBeNull();
  expect(tierForValue(30, [7, 30, 100, 365])).toBe("silver");
  expect(tierForValue(9999, [7, 30, 100, 365])).toBe("obsidian");
});

test("calendarToYear indexes from Jan 1", () => {
  const y = calendarToYear(2026, {
    totalCommitContributions: 3, totalPullRequestReviewContributions: 1, restrictedContributionsCount: 0,
    contributionCalendar: { totalContributions: 5, weeks: [{ contributionDays: [
      { date: "2025-12-31", contributionCount: 9 },
      { date: "2026-01-01", contributionCount: 2 },
      { date: "2026-01-03", contributionCount: 3 },
    ] }] },
  }, "t");
  expect(y.days).toEqual([2, 0, 3]);
  expect(y.commits).toBe(3);
});
