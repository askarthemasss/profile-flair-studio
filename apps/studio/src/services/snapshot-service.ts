import type { GithubSnapshot } from "@sigil/core";
import { ENV } from "../lib/env.js";

/**
 * Creates a mock snapshot for previewing or when the API is unreachable.
 */
export function getDemoSnapshot(login: string): GithubSnapshot {
  const currentYear = new Date().getFullYear();
  // 365 days of contributions
  const days: number[] = Array.from({ length: 365 }, (_, i) => {
    // Generate realistic contribution cadence
    const weekday = i % 7;
    if (weekday === 0 || weekday === 6)
      return Math.random() > 0.6 ? Math.floor(Math.random() * 4) : 0;
    return Math.random() > 0.2 ? Math.floor(Math.random() * 8) + 1 : 0;
  });
  const total = days.reduce((a, b) => a + b, 0);

  return {
    schema: 1,
    login,
    githubId: 1048576,
    name: "Veera Siddhan",
    bio: "Building systems, crafting SVG telemetry, and exploring compiler architecture.",
    createdAt: "2019-03-14T00:00:00Z",
    avatarDataUri: null,
    followers: 284,
    following: 73,
    gists: 14,
    organizations: 3,
    totals: {
      commits: 3420,
      prsOpened: 142,
      prsMerged: 136,
      reviews: 98,
      issues: 47,
      ownedRepos: 32,
      contributedTo: 48,
      discussionAnswers: 12,
      starsEarned: 890,
      forksEarned: 115,
      restrictedContributions: 240,
    },
    streak: {
      current: 19,
      currentStart: "2026-08-30T00:00:00Z",
      longest: 46,
      longestStart: "2025-05-12T00:00:00Z",
      longestEnd: "2025-06-27T00:00:00Z",
      totalContributions: total,
      activeDays: 248,
      busiestDay: { date: "2026-06-18", count: 24 },
    },
    years: [{ year: currentYear, total, days }],
    languages: [
      { name: "TypeScript", color: "#3178c6", bytes: 480000 },
      { name: "Rust", color: "#dea584", bytes: 260000 },
      { name: "Go", color: "#00add8", bytes: 140000 },
      { name: "CSS", color: "#563d7c", bytes: 64000 },
      { name: "HTML", color: "#e34c26", bytes: 32000 },
    ],
    topRepos: [
      {
        nameWithOwner: `${login}/sigil`,
        description: "Zero-runtime GitHub profile flair studio & SVG cards",
        stars: 482,
        forks: 38,
        language: { name: "TypeScript", color: "#3178c6" },
        pushedAt: new Date().toISOString(),
        isArchived: false,
      },
      {
        nameWithOwner: `${login}/tokio-flow`,
        description: "Async workflow orchestration engine in Rust",
        stars: 240,
        forks: 18,
        language: { name: "Rust", color: "#dea584" },
        pushedAt: new Date().toISOString(),
        isArchived: false,
      },
      {
        nameWithOwner: `${login}/ledger-themes`,
        description: "Dark mode color palettes designed for developers",
        stars: 124,
        forks: 9,
        language: { name: "CSS", color: "#563d7c" },
        pushedAt: new Date().toISOString(),
        isArchived: false,
      },
    ],
    fetchedAt: new Date().toISOString(),
    source: "public_pool",
  };
}

export async function fetchSnapshot(login: string): Promise<GithubSnapshot> {
  if (!login) return getDemoSnapshot("veera-siddhan");

  try {
    const res = await fetch(`${ENV.RENDER_API_URL}/snapshot/${encodeURIComponent(login)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return getDemoSnapshot(login);
    }
    return await res.json();
  } catch {
    return getDemoSnapshot(login);
  }
}
