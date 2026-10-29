/**
 * Normalize raw GitHub API responses into GithubSnapshot shape.
 * Pure — no I/O, no side effects.
 */
import type {
  GithubSnapshot,
  LanguageStat,
  RepoStat,
  ContributionYear,
} from "../types.js";
import { computeStreak } from "../stats/streak.js";

/** Raw shape returned by the STATS_QUERY GraphQL response */
export interface RawStatsResponse {
  user: {
    databaseId: number;
    login: string;
    name: string | null;
    bio: string | null;
    createdAt: string;
    avatarUrl: string;
    followers: { totalCount: number };
    following: { totalCount: number };
    gists: { totalCount: number };
    organizations: { totalCount: number };
    repositories: {
      totalCount: number;
      nodes: Array<{
        stargazerCount: number;
        forkCount: number;
        primaryLanguage: { name: string; color: string | null } | null;
        languages: {
          edges: Array<{ size: number; node: { name: string; color: string | null } }>;
        };
      }>;
    };
    contributionsCollection: {
      totalCommitContributions: number;
      restrictedContributionsCount: number;
      totalIssueContributions: number;
      totalPullRequestContributions?: number;
      totalPullRequestReviewContributions?: number;
      totalRepositoriesWithContributedCommits: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: Array<{ date: string; contributionCount: number }>;
        }>;
      };
    };
  };
}

/** Aggregate language bytes across all repos */
function aggregateLanguages(
  repos: RawStatsResponse["user"]["repositories"]["nodes"],
): LanguageStat[] {
  const map = new Map<string, { color: string | null; bytes: number }>();
  for (const repo of repos) {
    for (const edge of repo.languages.edges) {
      const existing = map.get(edge.node.name);
      if (existing) {
        existing.bytes += edge.size;
      } else {
        map.set(edge.node.name, { color: edge.node.color, bytes: edge.size });
      }
    }
  }
  return [...map.entries()]
    .map(([name, { color, bytes }]) => ({ name, color, bytes }))
    .sort((a, b) => b.bytes - a.bytes);
}

export function normalizeStatsResponse(
  raw: RawStatsResponse,
  source: "public_pool" | "user_token",
  topRepos: RepoStat[] = [],
  years: ContributionYear[] = [],
): GithubSnapshot {
  const { user } = raw;
  const cc = user.contributionsCollection;
  const days = cc.contributionCalendar.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
  );

  const starsEarned = user.repositories.nodes.reduce(
    (sum, r) => sum + r.stargazerCount,
    0,
  );
  const forksEarned = user.repositories.nodes.reduce(
    (sum, r) => sum + r.forkCount,
    0,
  );

  return {
    schema: 1,
    login: user.login,
    githubId: user.databaseId,
    name: user.name,
    bio: user.bio,
    createdAt: user.createdAt,
    avatarDataUri: null, // fetched separately by the avatar pipeline
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    gists: user.gists.totalCount,
    organizations: user.organizations.totalCount,
    totals: {
      commits: cc.totalCommitContributions,
      prsOpened: cc.totalPullRequestContributions ?? 0,
      prsMerged: 0, // not returned by GitHub; enriched separately
      reviews: cc.totalPullRequestReviewContributions ?? 0,
      issues: cc.totalIssueContributions,
      ownedRepos: user.repositories.totalCount,
      contributedTo: cc.totalRepositoriesWithContributedCommits,
      discussionAnswers: 0, // enriched separately
      starsEarned,
      forksEarned,
      restrictedContributions: cc.restrictedContributionsCount,
    },
    streak: computeStreak(days),
    years,
    languages: aggregateLanguages(user.repositories.nodes),
    topRepos,
    fetchedAt: new Date().toISOString(),
    source,
  };
}
