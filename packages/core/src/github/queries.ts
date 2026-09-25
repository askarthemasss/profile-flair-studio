/**
 * GraphQL documents. GraphQL only — no REST, no HTML scraping.
 *
 * Strategy (target < 10 points per refresh):
 *  - PROFILE_QUERY: profile + first 100 owned repos + the current year's calendar.
 *  - REPOS_PAGE_QUERY: extra repo pages, capped at 300 repos total.
 *  - YEAR_QUERY: one small query per past contribution year, cached 30 days.
 * Every document selects rateLimit { cost remaining resetAt } so cost is logged.
 *
 * Schema notes (checked against GitHub's public schema):
 *  - `repositoriesContributedTo` requires `first` even when only totalCount is read.
 *  - `contributionsCollection` spans at most one year; `from`/`to` must be ≤ 1 year apart.
 *  - `repositoryDiscussionComments(onlyAnswers: true)` counts accepted answers.
 */

const RATE = `rateLimit { cost remaining resetAt }`;

const REPO_FIELDS = `
  nameWithOwner description stargazerCount forkCount isArchived pushedAt
  primaryLanguage { name color }
  languages(first: 8, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } }
`;

const CALENDAR = `
  totalCommitContributions totalPullRequestReviewContributions restrictedContributionsCount
  contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
`;

export const PROFILE_QUERY = `
query Snapshot($login: String!, $from: DateTime!, $to: DateTime!) {
  ${RATE}
  user(login: $login) {
    databaseId login name bio avatarUrl(size: 96) createdAt
    followers { totalCount }  following { totalCount }
    gists(privacy: PUBLIC) { totalCount }  organizations { totalCount }
    pullRequests { totalCount }
    mergedPRs: pullRequests(states: MERGED) { totalCount }
    issues { totalCount }
    repositoryDiscussionComments(onlyAnswers: true) { totalCount }
    repositoriesContributedTo(first: 1, includeUserRepositories: false,
      contributionTypes: [COMMIT, PULL_REQUEST, ISSUE, PULL_REQUEST_REVIEW]) { totalCount }
    contributionsCollection(from: $from, to: $to) {
      contributionYears
      ${CALENDAR}
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false,
      orderBy: { field: STARGAZERS, direction: DESC }) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes { ${REPO_FIELDS} }
    }
  }
}`;

export const REPOS_PAGE_QUERY = `
query SnapshotRepos($login: String!, $after: String!) {
  ${RATE}
  user(login: $login) {
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, isFork: false,
      orderBy: { field: STARGAZERS, direction: DESC }) {
      pageInfo { hasNextPage endCursor }
      nodes { ${REPO_FIELDS} }
    }
  }
}`;

export const YEAR_QUERY = `
query SnapshotYear($login: String!, $from: DateTime!, $to: DateTime!) {
  ${RATE}
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) { ${CALENDAR} }
  }
}`;

export const REPO_CAP = 300;
