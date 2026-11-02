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
import type { SupabaseRest } from "../db/supabase-rest.js";
import type { TokenPool } from "./token-pool.js";

interface RefreshOptions {
  login: string;
  tokenPool: TokenPool;
  supabase?: SupabaseRest;
  forceRefresh?: boolean;
}

/** Snapshots younger than this are served without hitting GitHub. */
const FRESH_TTL_MS = 1000 * 60 * 60 * 4;

/** Inclusive date range GitHub's contributionsCollection expects. */
function yearRange(year: number): { from: string; to: string } {
  return {
    from: `${year}-01-01T00:00:00Z`,
    to: `${year}-12-31T23:59:59Z`,
  };
}

export async function getOrRefreshSnapshot(
  opts: RefreshOptions,
): Promise<{ snapshot: GithubSnapshot | null; error: "NOT_FOUND" | "UPSTREAM" | null }> {
  const { login, tokenPool, supabase, forceRefresh } = opts;

  // 1. Look up the cached snapshot. Fresh entries short-circuit; stale ones are
  // kept as a fallback so an upstream outage does not take the cards down.
  let staleSnapshot: GithubSnapshot | null = null;

  if (supabase && !forceRefresh) {
    const cached = await supabase.get<any>(
      "snapshots",
      `login=eq.${encodeURIComponent(login)}&select=data,fetched_at`,
    );
    if (cached && cached.length > 0 && cached[0]?.data) {
      const fetchedAt = new Date(cached[0].fetched_at).getTime();
      const ageMs = Date.now() - fetchedAt;

      if (ageMs < FRESH_TTL_MS) {
        return { snapshot: cached[0].data as GithubSnapshot, error: null };
      }

      staleSnapshot = cached[0].data as GithubSnapshot;
    }
  }

  // 2. Resolve token
  const token = tokenPool.getToken();
  if (!token) {
    return staleSnapshot
      ? { snapshot: staleSnapshot, error: null }
      : { snapshot: null, error: "UPSTREAM" };
  }

  // 3. Fetch raw stats, top repos, the year list, and the current year's
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
    // else (rate limit, 5xx, network) is transient, so prefer stale data.
    if (!statsRes.error) {
      return { snapshot: null, error: "NOT_FOUND" };
    }
    return staleSnapshot
      ? { snapshot: staleSnapshot, error: null }
      : { snapshot: null, error: "UPSTREAM" };
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

  // 4. Fetch and embed avatar data URI
  if (statsRes.data.user.avatarUrl) {
    const avatarDataUri = await fetchAvatarDataUri(statsRes.data.user.avatarUrl);
    snapshot.avatarDataUri = avatarDataUri;
  }

  // 5. Cache to Supabase in background
  if (supabase) {
    supabase
      .upsert("snapshots", {
        login,
        data: snapshot,
        fetched_at: new Date().toISOString(),
      })
      .catch(() => {});
  }

  return { snapshot, error: null };
}
