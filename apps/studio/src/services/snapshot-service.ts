import type { GithubSnapshot } from "@sigil/core";
import { ENV } from "../lib/env.js";
import { SnapshotError, fetchLiveProfile } from "./github-rest.js";
import { buildDemoContributions } from "./demo-contributions.js";

const DEMO_LOGIN = "torvalds";

/**
 * The generated contribution year is login-independent, so it is built once per
 * local day and shared by every demo handle. Rebuilding it for each render
 * would regenerate hundreds of random days for a preview that never changes.
 */
let demoBase: { day: string; snapshot: GithubSnapshot } | null = null;

/**
 * Creates a mock snapshot for previewing or when the API is unreachable.
 *
 * Contribution days, streaks, and the busiest day all come from the same
 * generated year, so the numbers agree with the heatmap and never report an
 * expired streak as current.
 */
function buildDemoSnapshot(login: string, now: Date): GithubSnapshot {
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

/**
 * Returns the shared demo snapshot for a handle. The generated year is cached
 * per local day, and only the login-bearing fields are rewritten per handle.
 */
export function getDemoSnapshot(login: string): GithubSnapshot {
  const now = new Date();
  const day = now.toDateString();
  if (!demoBase || demoBase.day !== day) {
    demoBase = { day, snapshot: buildDemoSnapshot(DEMO_LOGIN, now) };
  }

  const handle = login.trim() || DEMO_LOGIN;
  if (handle === demoBase.snapshot.login) return demoBase.snapshot;

  return {
    ...demoBase.snapshot,
    login: handle,
    topRepos: demoBase.snapshot.topRepos.map((repo) => ({
      ...repo,
      nameWithOwner: repo.nameWithOwner.replace(/^[^/]+\//, `${handle}/`),
    })),
  };
}

const LIVE_TTL_MS = 1000 * 60 * 10;
const liveCache = new Map<string, { snapshot: GithubSnapshot; expiresAt: number }>();

interface FetchSnapshotOptions {
  /**
   * Bypass both the Worker's freshness window (`?force=1`) and the local
   * 10-minute cache. Used by the studio's explicit Load button.
   */
  force?: boolean;
}

export async function fetchSnapshot(
  login: string,
  signal?: AbortSignal,
  options: FetchSnapshotOptions = {},
): Promise<GithubSnapshot> {
  const handle = login.trim();
  if (!handle) return getDemoSnapshot(DEMO_LOGIN);

  const force = options.force === true;
  const key = handle.toLowerCase();

  // Deployed Worker first: the same user-facing answer, one request, and the
  // token pool lives server-side.
  if (ENV.HAS_RENDER_API) {
    try {
      const url = new URL(`${ENV.RENDER_API_URL}/snapshot/${encodeURIComponent(handle)}`);
      if (force) url.searchParams.set("force", "1");

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        signal,
        // The Worker serves its own edge cache; an explicit Load must not be
        // answered by the browser's HTTP cache for a previous `?force=1` hit.
        cache: force ? "no-store" : "default",
      });
      if (res.ok) return (await res.json()) as GithubSnapshot;

      // A genuine not-found answer should not fall through to a second lookup
      // that spends the anonymous browser budget to learn the same thing.
      if (res.status === 404) {
        const body = (await res.json().catch(() => null)) as { code?: string } | null;
        if (body?.code === "NOT_FOUND") {
          throw new SnapshotError("not_found", "No GitHub user with that login", 404);
        }
      }
    } catch (error) {
      if (signal?.aborted) throw error;
      if (error instanceof SnapshotError) throw error;
      // fall through to the browser-side fetch below
    }
  }

  // Direct browser fetch of GitHub's public API. Explicit loads skip this cache
  // so pressing Load again actually refreshes the data.
  if (!force) {
    const cached = liveCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.snapshot;
  }

  const snapshot = await fetchLiveProfile(handle, signal);
  liveCache.set(key, { snapshot, expiresAt: Date.now() + LIVE_TTL_MS });
  return snapshot;
}
