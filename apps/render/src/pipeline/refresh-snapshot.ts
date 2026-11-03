import type { ContributionYear, GithubSnapshot, RepoStat } from "@sigil/core";
import {
  CONTRIBUTION_YEARS_QUERY,
  STATS_QUERY,
  TOP_REPOS_QUERY,
  YEAR_CONTRIBUTIONS_QUERY,
  buildContributionYear,
  normalizeStatsResponse,
  selectContributionYears,
  type RawStatsResponse,
  type RawYearResponse,
  type RawYearsResponse,
} from "@sigil/core";
import { executeGithubGraphQL } from "./github-client.js";
import { fetchAvatarDataUri } from "./avatar.js";
import type { TokenPool } from "./token-pool.js";

/** Where normalized snapshots are cached. No database, just the edge cache. */
export interface SnapshotCache {
  get(login: string): Promise<{ snapshot: GithubSnapshot; fetchedAt: number } | null>;
  put(login: string, snapshot: GithubSnapshot): Promise<void>;
  delete(login: string): Promise<void>;
}

interface RefreshOptions {
  login: string;
  tokenPool: TokenPool;
  cache?: SnapshotCache;
  forceRefresh?: boolean;
}

interface RefreshResult {
  snapshot: GithubSnapshot | null;
  error: "NOT_FOUND" | "UPSTREAM" | null;
}

export interface SnapshotResult extends RefreshResult {
  /** True when a cached snapshot was served past its TTL. */
  stale?: boolean;
  /** Refresh that was started for a stale snapshot; hand it to `waitUntil`. */
  revalidate?: Promise<void>;
}

/** Snapshots younger than this are served without hitting GitHub. */
const FRESH_TTL_MS = 1000 * 60 * 60 * 4;

/**
 * In-flight refreshes, keyed by lowercased login. A burst of card requests for
 * one user shares a single GitHub round trip instead of one per request.
 */
const inFlight = new Map<string, Promise<RefreshResult>>();

/** Inclusive date range GitHub's contributionsCollection expects. */
function yearRange(year: number): { from: string; to: string } {
  return {
    from: `${year}-01-01T00:00:00Z`,
    to: `${year}-12-31T23:59:59Z`,
  };
}

function refreshOnce(opts: RefreshOptions): Promise<RefreshResult> {
  const key = opts.login.toLowerCase();
  const running = inFlight.get(key);
  if (running) return running;

  const promise = refreshSnapshot(opts).finally(() => {
    if (inFlight.get(key) === promise) inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}

export async function getOrRefreshSnapshot(opts: RefreshOptions): Promise<SnapshotResult> {
  const { login, cache, forceRefresh } = opts;

  // 1. Look up the cached snapshot. Fresh entries short-circuit; stale ones are
  // served immediately while a refresh runs in the background.
  let staleSnapshot: GithubSnapshot | null = null;

  if (cache && !forceRefresh) {
    const cached = await cache.get(login);
    if (cached) {
      if (Date.now() - cached.fetchedAt < FRESH_TTL_MS) {
        return { snapshot: cached.snapshot, error: null };
      }
      staleSnapshot = cached.snapshot;
    }
  }

  if (staleSnapshot) {
    // Never make a reader wait on GitHub for a snapshot we already have. The
    // caller hands `revalidate` to `waitUntil` so the isolate stays alive long
    // enough to write the refreshed copy.
    return {
      snapshot: staleSnapshot,
      error: null,
      stale: true,
      revalidate: refreshOnce(opts)
        .then(() => undefined)
        .catch(() => undefined),
    };
  }

  // 2. Nothing cached: this request has to pay for the fetch.
  return refreshOnce(opts);
}

async function refreshSnapshot({
  login,
  tokenPool,
  cache,
}: RefreshOptions): Promise<RefreshResult> {
  // 1. Resolve token
  const token = tokenPool.getToken();
  if (!token) {
    return { snapshot: null, error: "UPSTREAM" };
  }

  // 2. Fetch raw stats, top repos, the year list, and the current year's
  // calendar in parallel. The current year is always needed (skyline defaults
  // to it), so asking for it now avoids an extra round trip.
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const [statsRes, reposRes, yearsRes, currentYearRes] = await Promise.all([
    executeGithubGraphQL<RawStatsResponse>(STATS_QUERY, { login, includePrs: true }, token),
    executeGithubGraphQL<{ user: { repositories: { nodes: any[] } } }>(
      TOP_REPOS_QUERY,
      { login },
      token,
    ),
    executeGithubGraphQL<RawYearsResponse>(CONTRIBUTION_YEARS_QUERY, { login }, token),
    executeGithubGraphQL<RawYearResponse>(
      YEAR_CONTRIBUTIONS_QUERY,
      { login, ...yearRange(currentYear) },
      token,
    ),
  ]);

  if (!statsRes.data?.user) {
    // A real "no such user" answer has no transport error attached. Anything
    // else (rate limit, 5xx, network) is transient, so the caller may still
    // serve stale data.
    if (statsRes.error) {
      return { snapshot: null, error: "UPSTREAM" };
    }

    // The account was deleted or renamed. Drop the cached copy so later
    // requests return 404 instead of serving the old profile forever.
    if (cache) {
      await cache.delete(login);
    }
    return { snapshot: null, error: "NOT_FOUND" };
  }

  const topRepos: RepoStat[] = (reposRes.data?.user?.repositories?.nodes ?? []).map((n) => ({
    nameWithOwner: n.nameWithOwner,
    description: n.description,
    stars: n.stargazerCount,
    forks: n.forkCount,
    language: n.primaryLanguage
      ? { name: n.primaryLanguage.name, color: n.primaryLanguage.color }
      : null,
    pushedAt: n.pushedAt,
    isArchived: Boolean(n.isArchived),
  }));

  // Older years are only fetched when they exist; failures degrade to fewer
  // years instead of failing the whole snapshot.
  const olderYears = selectContributionYears(
    yearsRes.data?.user?.contributionsCollection?.contributionYears ?? [],
    now,
  ).filter((year) => year !== currentYear);

  const olderResults = await Promise.all(
    olderYears.map((year) =>
      executeGithubGraphQL<RawYearResponse>(
        YEAR_CONTRIBUTIONS_QUERY,
        { login, ...yearRange(year) },
        token,
      ),
    ),
  );

  const years: ContributionYear[] = [];
  const yearCalendars = [
    { year: currentYear, result: currentYearRes },
    ...olderYears.map((year, i) => ({ year, result: olderResults[i] })),
  ];
  for (const { year, result } of yearCalendars) {
    const calendar = result?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) continue;
    const contributionYear = buildContributionYear(year, calendar, now);
    if (contributionYear) years.push(contributionYear);
  }

  const snapshot = normalizeStatsResponse(statsRes.data, topRepos, years);

  // 3. Fetch and embed avatar data URI
  if (statsRes.data.user.avatarUrl) {
    const avatarDataUri = await fetchAvatarDataUri(statsRes.data.user.avatarUrl);
    snapshot.avatarDataUri = avatarDataUri;
  }

  // 4. Persist before resolving, so a `waitUntil`-ed refresh is not cancelled
  // mid-write when the response has already been sent.
  if (cache) {
    await cache.put(login, snapshot);
  }

  return { snapshot, error: null };
}
