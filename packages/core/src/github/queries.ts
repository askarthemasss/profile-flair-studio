/**
 * GitHub GraphQL queries.
 *
 * Single source of truth for both the render Worker and the GitHub Action.
 * Zero runtime deps — just strings.
 */

/** Fetch core stats + last 52 weeks of contribution calendar. */
export const STATS_QUERY = /* GraphQL */ `
  query SigilStats($login: String!, $includePrs: Boolean = true) {
    user(login: $login) {
      databaseId
      login
      name
      bio
      createdAt
      avatarUrl(size: 96)
      followers { totalCount }
      following { totalCount }
      gists { totalCount }
      organizations { totalCount }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
        totalCount
        nodes {
          stargazerCount
          forkCount
          primaryLanguage { name color }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        restrictedContributionsCount
        totalIssueContributions
        totalPullRequestContributions @include(if: $includePrs)
        totalPullRequestReviewContributions @include(if: $includePrs)
        totalRepositoriesWithContributedCommits
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount }
          }
        }
      }
    }
  }
`;

/** Fetch a specific user's years list for the skyline card. */
export const CONTRIBUTION_YEARS_QUERY = /* GraphQL */ `
  query SigilYears($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionYears
      }
    }
  }
`;

/** Fetch a single year's daily contribution data. */
export const YEAR_CONTRIBUTIONS_QUERY = /* GraphQL */ `
  query SigilYearContributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount }
          }
        }
      }
    }
  }
`;

/** Fetch top repos for the repo card. */
export const TOP_REPOS_QUERY = /* GraphQL */ `
  query SigilTopRepos($login: String!) {
    user(login: $login) {
      repositories(
        first: 30
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          nameWithOwner
          description
          stargazerCount
          forkCount
          primaryLanguage { name color }
          pushedAt
          isArchived
        }
      }
    }
  }
`;
