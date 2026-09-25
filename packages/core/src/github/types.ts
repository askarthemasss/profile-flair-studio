export interface RateLimit {
  cost: number;
  remaining: number;
  resetAt: string;
}

export interface GqlCalendar {
  totalCommitContributions: number;
  totalPullRequestReviewContributions: number;
  restrictedContributionsCount: number;
  contributionCalendar: {
    totalContributions: number;
    weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
  };
}

export interface GqlRepo {
  nameWithOwner: string;
  description: string | null;
  stargazerCount: number;
  forkCount: number;
  isArchived: boolean;
  pushedAt: string | null;
  primaryLanguage: { name: string; color: string | null } | null;
  languages: { edges: { size: number; node: { name: string; color: string | null } }[] } | null;
}

export interface GqlRepoPage {
  totalCount?: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: GqlRepo[];
}

export interface GqlProfile {
  databaseId: number;
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  createdAt: string;
  followers: { totalCount: number };
  following: { totalCount: number };
  gists: { totalCount: number };
  organizations: { totalCount: number };
  pullRequests: { totalCount: number };
  mergedPRs: { totalCount: number };
  issues: { totalCount: number };
  repositoryDiscussionComments: { totalCount: number };
  repositoriesContributedTo: { totalCount: number };
  contributionsCollection: GqlCalendar & { contributionYears: number[] };
  repositories: GqlRepoPage;
}

/** One calendar year of daily counts. days[0] = Jan 1 (UTC). */
export interface ContributionYear {
  year: number;
  total: number;
  days: number[];
  /** Commit / review totals for the year (kept in the snapshot, not the table). */
  commits?: number;
  reviews?: number;
  fetchedAt: string;
}

export interface RepoSummary {
  name: string;
  description: string;
  stars: number;
  forks: number;
  archived: boolean;
  pushedAt: string | null;
  language: string | null;
  languageColor: string | null;
  languages: { name: string; color: string | null; bytes: number }[];
}

export interface LanguageStat {
  name: string;
  color: string | null;
  bytes: number;
  pct: number;
}

export interface StreakStats {
  current: number;
  longest: number;
  activeDays: number;
  currentStart: string | null;
  longestStart: string | null;
  longestEnd: string | null;
}

/** The normalized, aggregated per-login snapshot (stored in snapshots.data). */
export interface GithubSnapshot {
  version: 1;
  githubId: number;
  login: string;
  name: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  counts: {
    followers: number;
    following: number;
    gists: number;
    organizations: number;
    pullRequests: number;
    prsMerged: number;
    issues: number;
    discussionAnswers: number;
    contributedTo: number;
    commits: number;
    reviews: number;
    restricted: number;
    stars: number;
    repos: number;
    contributions: number;
  };
  streak: StreakStats;
  languages: LanguageStat[];
  /** Top 30 by stars. */
  topRepos: RepoSummary[];
  /** Highest star count on a single owned repo (Starstruck estimate). */
  maxRepoStars: number;
  years: ContributionYear[];
  /** Total GraphQL points spent producing this snapshot. */
  cost: number;
  fetchedAt: string;
}
