import { describe, it, expect } from "vitest";
import {
  buildContributionYear,
  selectContributionYears,
  type RawContributionCalendar,
} from "../github/normalize.js";

function calendar(entries: Array<[date: string, count: number]>): RawContributionCalendar {
  return {
    totalContributions: entries.reduce((sum, [, count]) => sum + count, 0),
    weeks: [
      {
        contributionDays: entries.map(([date, contributionCount]) => ({
          date,
          contributionCount,
        })),
      },
    ],
  };
}

describe("buildContributionYear", () => {
  it("maps dates to day-of-year indexes and trims the current year to today", () => {
    const year = buildContributionYear(
      2026,
      calendar([
        ["2026-01-01", 3],
        ["2026-01-03", 5],
        ["2026-10-31", 2],
      ]),
      new Date("2026-10-31T12:00:00Z"),
    );

    expect(year).not.toBeNull();
    expect(year!.year).toBe(2026);
    expect(year!.total).toBe(10);
    expect(year!.days).toHaveLength(304); // Jan 1 through Oct 31
    expect(year!.days[0]).toBe(3);
    expect(year!.days[1]).toBe(0);
    expect(year!.days[2]).toBe(5);
    expect(year!.days[303]).toBe(2);
  });

  it("keeps a full year for past years", () => {
    const year = buildContributionYear(
      2025,
      calendar([["2025-01-01", 4]]),
      new Date("2026-10-31T12:00:00Z"),
    );

    expect(year!.days).toHaveLength(365);
    expect(year!.days[0]).toBe(4);
    expect(year!.days[364]).toBe(0);
  });

  it("allocates 366 days in leap years", () => {
    const year = buildContributionYear(
      2028,
      calendar([["2028-12-31", 7]]),
      new Date("2028-12-31T23:00:00Z"),
    );

    expect(year!.days).toHaveLength(366);
    expect(year!.days[365]).toBe(7);
  });

  it("ignores days that belong to another year", () => {
    const year = buildContributionYear(
      2026,
      calendar([
        ["2025-12-31", 9],
        ["2026-01-02", 1],
        ["2027-01-01", 9],
      ]),
      new Date("2026-10-31T12:00:00Z"),
    );

    expect(year!.total).toBe(1);
    expect(year!.days[0]).toBe(0);
    expect(year!.days[1]).toBe(1);
  });

  it("returns null for an empty calendar", () => {
    expect(buildContributionYear(2026, calendar([]), new Date("2026-10-31T12:00:00Z"))).toBeNull();
  });
});

describe("selectContributionYears", () => {
  const now = new Date("2026-10-31T12:00:00Z");

  it("dedupes, drops future years, adds the current year, and sorts ascending", () => {
    expect(selectContributionYears([2023, 2025, 2024, 2024, 2027], now)).toEqual([
      2024, 2025, 2026,
    ]);
  });

  it("honours the limit while keeping the newest years", () => {
    expect(selectContributionYears([2020, 2021, 2022], now, 2)).toEqual([2022, 2026]);
  });

  it("always includes the current year", () => {
    expect(selectContributionYears([], now)).toEqual([2026]);
  });
});
