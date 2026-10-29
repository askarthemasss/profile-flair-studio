import { describe, it, expect } from "vitest";
import { computeRank } from "../stats/rank.js";
import { computeStreak } from "../stats/streak.js";
import { computeAchievements } from "../stats/achievements-defs.js";
import type { GithubSnapshot } from "../types.js";

function createMockSnapshot(overrides: Partial<GithubSnapshot> = {}): GithubSnapshot {
  return {
    schema: 1,
    login: "octocat",
    githubId: 583231,
    name: "The Octocat",
    bio: "Building cool things",
    createdAt: "2011-01-25T18:44:36Z",
    avatarDataUri: null,
    followers: 500,
    following: 10,
    gists: 8,
    organizations: 2,
    totals: {
      commits: 1200,
      prsOpened: 80,
      prsMerged: 75,
      issues: 30,
      reviews: 45,
      starsEarned: 350,
      forksEarned: 50,
      discussionAnswers: 5,
      ownedRepos: 25,
      contributedTo: 15,
      restrictedContributions: 100,
    },
    streak: {
      current: 5,
      currentStart: "2024-01-01",
      longest: 30,
      longestStart: "2023-05-01",
      longestEnd: "2023-05-30",
      totalContributions: 1500,
      activeDays: 120,
      busiestDay: { date: "2023-06-15", count: 25 },
    },
    years: [],
    languages: [
      { name: "TypeScript", color: "#3178c6", bytes: 100000 },
      { name: "Rust", color: "#dea584", bytes: 50000 },
    ],
    topRepos: [],
    fetchedAt: new Date().toISOString(),
    source: "public_pool",
    ...overrides,
  };
}

describe("computeRank", () => {
  it("computes high rank for prolific contributor", () => {
    const prolific = createMockSnapshot({
      followers: 4000,
      totals: {
        commits: 14000,
        prsOpened: 900,
        prsMerged: 850,
        issues: 400,
        reviews: 400,
        starsEarned: 8000,
        forksEarned: 500,
        discussionAnswers: 50,
        ownedRepos: 150,
        contributedTo: 200,
        restrictedContributions: 500,
      },
      streak: {
        current: 100,
        currentStart: null,
        longest: 300,
        longestStart: null,
        longestEnd: null,
        totalContributions: 15000,
        activeDays: 300,
        busiestDay: null,
      },
    });

    const result = computeRank(prolific);
    expect(["master", "grandmaster", "legend"]).toContain(result.tier);
    expect(result.score).toBeGreaterThan(0.7);
  });

  it("computes initiate or apprentice for beginner", () => {
    const beginner = createMockSnapshot({
      followers: 2,
      totals: {
        commits: 15,
        prsOpened: 1,
        prsMerged: 1,
        issues: 0,
        reviews: 0,
        starsEarned: 0,
        forksEarned: 0,
        discussionAnswers: 0,
        ownedRepos: 1,
        contributedTo: 0,
        restrictedContributions: 0,
      },
      streak: {
        current: 1,
        currentStart: null,
        longest: 2,
        longestStart: null,
        longestEnd: null,
        totalContributions: 15,
        activeDays: 2,
        busiestDay: null,
      },
    });

    const result = computeRank(beginner);
    expect(["initiate", "apprentice"]).toContain(result.tier);
  });
});

describe("computeStreak", () => {
  it("returns zero streak for empty input", () => {
    const result = computeStreak([]);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
  });

  it("computes longest streak correctly", () => {
    const days = [
      { date: "2024-01-01", count: 1 },
      { date: "2024-01-02", count: 2 },
      { date: "2024-01-03", count: 0 },
      { date: "2024-01-04", count: 1 },
      { date: "2024-01-05", count: 3 },
      { date: "2024-01-06", count: 2 },
    ];
    const result = computeStreak(days);
    expect(result.longest).toBe(3);
    expect(result.longestStart).toBe("2024-01-04");
    expect(result.longestEnd).toBe("2024-01-06");
  });
});

describe("computeAchievements", () => {
  it("computes achievements based on snapshot metrics", () => {
    const snapshot = createMockSnapshot({
      totals: {
        commits: 2500,
        prsOpened: 200,
        prsMerged: 180,
        issues: 10,
        reviews: 60,
        starsEarned: 150,
        forksEarned: 5,
        discussionAnswers: 0,
        ownedRepos: 10,
        contributedTo: 30,
        restrictedContributions: 20,
      },
    });

    const achievements = computeAchievements(snapshot);
    const marathoner = achievements.find((a) => a.id === "commit-marathoner");
    expect(marathoner?.tier).toBe("silver");

    const pullShark = achievements.find((a) => a.id === "pull-shark");
    expect(pullShark?.tier).toBe("silver");
  });
});
