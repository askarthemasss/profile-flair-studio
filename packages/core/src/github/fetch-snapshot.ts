import { graphql } from "./client";
import { PROFILE_QUERY, REPO_CAP, REPOS_PAGE_QUERY, YEAR_QUERY } from "./queries";
import type {
  ContributionYear,
  GithubSnapshot,
  GqlCalendar,
  GqlProfile,
  GqlRepo,
  GqlRepoPage,
  RateLimit,
  RepoSummary,
} from "./types";
import { aggregateLanguages } from "../stats/languages";
import { computeStreak } from "../stats/streak";

export const PAST_YEAR_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface FetchOptions {
  now?: Date;
  hideArchived?: boolean;
  fetchImpl?: typeof fetch;
}

/**
 * Run the queries, normalize, aggregate.
 * `cachedYears` come from contribution_years; past years younger than 30 days are reused,
 * the current year is always re-fetched (it rides along in the profile query).
 */
export async function fetchSnapshot(
  login: string,
  token: string,
  cachedYears: ContributionYear[],
  options: FetchOptions = {},
): Promise<GithubSnapshot> {
  const now = options.now ?? new Date();
  const f = options.fetchImpl ?? fetch;
  const thisYear = now.getUTCFullYear();
  let cost = 0;

  const main = await graphql<{ rateLimit: RateLimit; user: GqlProfile | null }>(
    PROFILE_QUERY,
    { login, from: `${thisYear}-01-01T00:00:00Z`, to: now.toISOString() },
    token,
    `profile:${login}`,
    f,
  );
  cost += main.cost;
  const user = main.data.user;
  if (!user) throw Object.assign(new Error("User not found"), { kind: "not_found" });

  // Repositories beyond 100, capped at 300.
  const repoNodes: GqlRepo[] = [...user.repositories.nodes];
  let page: GqlRepoPage = user.repositories;
  while (page.pageInfo.hasNextPage && page.pageInfo.endCursor && repoNodes.length < REPO_CAP) {
    const next = await graphql<{ rateLimit: RateLimit; user: { repositories: GqlRepoPage } | null }>(
      REPOS_PAGE_QUERY,
      { login, after: page.pageInfo.endCursor },
      token,
      `repos:${login}`,
      f,
    );
    cost += next.cost;
    if (!next.data.user) break;
    page = next.data.user.repositories;
    repoNodes.push(...page.nodes);
  }
  const repos = repoNodes.slice(0, REPO_CAP).map(normalizeRepo);

  // Contribution years: current from the main query, past from cache or one query each.
  const fetchedAt = now.toISOString();
  const cached = new Map(cachedYears.map((y) => [y.year, y]));
  const years: ContributionYear[] = [
    calendarToYear(thisYear, user.contributionsCollection, fetchedAt),
  ];
  for (const year of user.contributionsCollection.contributionYears) {
    if (year >= thisYear) continue;
    const hit = cached.get(year);
    if (hit && now.getTime() - Date.parse(hit.fetchedAt) < PAST_YEAR_TTL_MS) {
      years.push(hit);
      continue;
    }
    const res = await graphql<{ rateLimit: RateLimit; user: { contributionsCollection: GqlCalendar } | null }>(
      YEAR_QUERY,
      { login, from: `${year}-01-01T00:00:00Z`, to: `${year}-12-31T23:59:59Z` },
      token,
      `year:${login}:${year}`,
      f,
    );
    cost += res.cost;
    if (res.data.user) years.push(calendarToYear(year, res.data.user.contributionsCollection, fetchedAt));
  }
  years.sort((a, b) => a.year - b.year);

  const owned = repos;
  const stars = owned.reduce((s, r) => s + r.stars, 0);
  const sum = (key: "commits" | "reviews") => years.reduce((s, y) => s + (y[key] ?? 0), 0);
  console.info(`[github] snapshot:${login} total cost=${cost}`);

  return {
    version: 1,
    githubId: user.databaseId,
    login: user.login.toLowerCase(),
    name: user.name ?? "",
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    counts: {
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      gists: user.gists.totalCount,
      organizations: user.organizations.totalCount,
      pullRequests: user.pullRequests.totalCount,
      prsMerged: user.mergedPRs.totalCount,
      issues: user.issues.totalCount,
      discussionAnswers: user.repositoryDiscussionComments.totalCount,
      contributedTo: user.repositoriesContributedTo.totalCount,
      commits: sum("commits"),
      reviews: sum("reviews"),
      restricted: user.contributionsCollection.restrictedContributionsCount,
      stars,
      repos: user.repositories.totalCount ?? owned.length,
      contributions: years.reduce((s, y) => s + y.total, 0),
    },
    streak: computeStreak(years, now),
    languages: aggregateLanguages(owned, { hideArchived: options.hideArchived ?? false }),
    topRepos: [...owned].sort((a, b) => b.stars - a.stars).slice(0, 30),
    maxRepoStars: owned.reduce((m, r) => Math.max(m, r.stars), 0),
    years,
    cost,
    fetchedAt,
  };
}

function normalizeRepo(repo: GqlRepo): RepoSummary {
  return {
    name: repo.nameWithOwner,
    description: repo.description ?? "",
    stars: Math.max(0, repo.stargazerCount),
    forks: Math.max(0, repo.forkCount),
    archived: repo.isArchived,
    pushedAt: repo.pushedAt,
    language: repo.primaryLanguage?.name ?? null,
    languageColor: repo.primaryLanguage?.color ?? null,
    languages: (repo.languages?.edges ?? []).map((e) => ({
      name: e.node.name,
      color: e.node.color,
      bytes: Math.max(0, e.size),
    })),
  };
}

/** Flatten a calendar to days[] where days[0] = Jan 1 of `year`. */
export function calendarToYear(year: number, c: GqlCalendar, fetchedAt: string): ContributionYear {
  const jan1 = Date.UTC(year, 0, 1);
  const days: number[] = [];
  for (const week of c.contributionCalendar.weeks) {
    for (const d of week.contributionDays) {
      const idx = Math.round((Date.parse(`${d.date}T00:00:00Z`) - jan1) / 86_400_000);
      if (idx < 0 || idx > 365) continue;
      while (days.length < idx) days.push(0);
      days[idx] = d.contributionCount;
    }
  }
  return {
    year,
    total: c.contributionCalendar.totalContributions,
    days,
    commits: c.totalCommitContributions,
    reviews: c.totalPullRequestReviewContributions,
    fetchedAt,
  };
}
