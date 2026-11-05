import type { GithubSnapshot } from "@sigil/core";
import { ENV } from "../lib/env.js";
import { SnapshotError, fetchLiveProfile } from "./github-rest.js";
import { buildDemoContributions } from "./demo-contributions.js";

/**
 * Creates a mock snapshot for previewing or when the API is unreachable.
 *
 * Contribution days, streaks, and the busiest day all come from the same
 * generated year, so the numbers agree with the heatmap and never report an
 * expired streak as current.
 */
export function getDemoSnapshot(login: string): GithubSnapshot {
  const now = new Date();
  const {
    year: currentYear,
    days,
    total,
    activeDays,
    current,
    currentStart,
    longest,
    longestStart,
    longestEnd,
    busiestDay,
  } = buildDemoContributions(now);

  return {
    schema: 1,
    login,
    githubId: 1024025,
    name: "Linus Torvalds",
    bio: "Creator of Linux and Git.",
    createdAt: "2011-09-03T15:26:22Z",
    avatarDataUri: null,
    followers: 329935,
    following: 0,
    gists: 1,
    organizations: 0,
    totals: {
      commits: 3796,
      prsOpened: 72,
      prsMerged: 72,
      reviews: 34,
      issues: 10,
      ownedRepos: 12,
      contributedTo: 1,
      discussionAnswers: 0,
      starsEarned: 263472,
      forksEarned: 67202,
      restrictedContributions: 0,
    },
    streak: {
      current,
      currentStart,
      longest,
      longestStart,
      longestEnd,
      totalContributions: total,
      activeDays,
      busiestDay,
    },
    years: [{ year: currentYear, total, days }],
    languages: [
      { name: "C", color: "#555555", bytes: 4450000 },
      { name: "OpenSCAD", color: "#e5d500", bytes: 550000 },
    ],
    topRepos: [
      {
        nameWithOwner: `${login}/linux`,
        description: "Linux kernel source tree",
        stars: 251353,
        forks: 67202,
        language: { name: "C", color: "#555555" },
        pushedAt: "2026-10-09T04:46:28Z",
        isArchived: false,
      },
      {
        nameWithOwner: `${login}/AudioNoise`,
        description: "Random digital audio effects",
        stars: 4509,
        forks: 224,
        language: { name: "C", color: "#555555" },
        pushedAt: "2026-05-08T17:20:22Z",
        isArchived: false,
      },
      {
        nameWithOwner: `${login}/GuitarPedal`,
        description: "Linus learns analog circuits",
        stars: 2441,
        forks: 124,
        language: { name: "C", color: "#555555" },
        pushedAt: "2026-10-05T22:45:45Z",
        isArchived: false,
      },
    ],
    fetchedAt: now.toISOString(),
    source: "public_pool",
  };
}

const LIVE_TTL_MS = 1000 * 60 * 10;
const liveCache = new Map<string, { snapshot: GithubSnapshot; expiresAt: number }>();

export async function fetchSnapshot(login: string): Promise<GithubSnapshot> {
  const handle = login.trim();
  if (!handle) return getDemoSnapshot("torvalds");

  // Deployed Worker first: the same user-facing answer, one request, and the
  // token pool lives server-side.
  if (ENV.HAS_RENDER_API) {
    try {
      const res = await fetch(`${ENV.RENDER_API_URL}/snapshot/${encodeURIComponent(handle)}`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) return (await res.json()) as GithubSnapshot;
    } catch {
      // fall through to the browser-side fetch below
    }
  }

  // Direct browser fetch of GitHub's public API. Results are cached briefly so
  // typing or reloading does not burn the unauthenticated hourly budget.
  const key = handle.toLowerCase();
  const cached = liveCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.snapshot;

  const snapshot = await fetchLiveProfile(handle);
  liveCache.set(key, { snapshot, expiresAt: Date.now() + LIVE_TTL_MS });
  return snapshot;
}
