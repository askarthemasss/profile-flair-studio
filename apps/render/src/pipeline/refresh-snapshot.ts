import type { GithubSnapshot, RepoStat } from "@sigil/core";
import {
  STATS_QUERY,
  TOP_REPOS_QUERY,
  normalizeStatsResponse,
  type RawStatsResponse,
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

export async function getOrRefreshSnapshot(
  opts: RefreshOptions,
): Promise<{ snapshot: GithubSnapshot | null; error: "NOT_FOUND" | "UPSTREAM" | null }> {
  const { login, tokenPool, supabase, forceRefresh } = opts;

  // 1. Check cached snapshot in Supabase if not forced
  if (supabase && !forceRefresh) {
    const cached = await supabase.get<any>(
      "snapshots",
      `login=eq.${encodeURIComponent(login)}&select=data,fetched_at`,
    );
    if (cached && cached.length > 0 && cached[0]?.data) {
      const fetchedAt = new Date(cached[0].fetched_at).getTime();
      const ageMs = Date.now() - fetchedAt;
      // Fresh for 4 hours
      if (ageMs < 1000 * 60 * 60 * 4) {
        return { snapshot: cached[0].data as GithubSnapshot, error: null };
      }
    }
  }

  // 2. Resolve token
  const token = tokenPool.getToken();
  if (!token) {
    return { snapshot: null, error: "UPSTREAM" };
  }

  // 3. Fetch raw stats and top repos in parallel
  const [statsRes, reposRes] = await Promise.all([
    executeGithubGraphQL<RawStatsResponse>(STATS_QUERY, { login, includePrs: true }, token),
    executeGithubGraphQL<{ user: { repositories: { nodes: any[] } } }>(
      TOP_REPOS_QUERY,
      { login },
      token,
    ),
  ]);

  if (!statsRes.data?.user) {
    return { snapshot: null, error: statsRes.error ? "UPSTREAM" : "NOT_FOUND" };
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

  const snapshot = normalizeStatsResponse(statsRes.data, topRepos);

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
