import { buildProfile, type RepoStats } from "@sigil/core/build-profile";
import { parseContributionHtml, type ContributionCalendar } from "@sigil/core/contributions";
import type { SigilProfile } from "@sigil/core/profile";

const USER_AGENT = "Sigil";

export class GitHubQuiet extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubQuiet";
  }
}

export interface LiveProfile {
  availability: "live";
  profile: SigilProfile;
  githubId: number;
}

export interface MissingProfile {
  availability: "missing";
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  bio: string | null;
  followers: number;
  public_repos: number;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
}

/** Public GitHub data only. Throws GitHubQuiet when the API will not answer. */
export async function loadGitHubProfile(login: string): Promise<LiveProfile | MissingProfile> {
  const userRes = await githubFetch(`https://api.github.com/users/${encodeURIComponent(login)}`);
  if (userRes.status === 404) return { availability: "missing" };
  if (userRes.status === 403 || userRes.status === 429) {
    throw new GitHubQuiet("GitHub rate limit");
  }
  if (!userRes.ok) throw new GitHubQuiet(`GitHub user ${userRes.status}`);

  const user = (await userRes.json()) as GitHubUser;
  const [repos, calendar] = await Promise.all([fetchRepos(login), fetchCalendar(login)]);

  const profile = buildProfile({
    login: user.login.toLowerCase(),
    name: user.name,
    bio: user.bio,
    followers: user.followers,
    publicRepos: user.public_repos,
    repos,
    contributionsTotal: calendar.total,
    days: calendar.days,
    today: new Date().toISOString().slice(0, 10),
  });

  return { availability: "live", profile, githubId: user.id };
}

async function fetchRepos(login: string): Promise<RepoStats[]> {
  const res = await githubFetch(
    `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=100&sort=updated&type=owner`,
  );
  if (!res.ok) return [];
  const repos = (await res.json()) as GitHubRepo[];
  if (!Array.isArray(repos)) return [];
  return repos.map((repo) => ({
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    language: repo.language,
    fork: Boolean(repo.fork),
  }));
}

async function fetchCalendar(login: string): Promise<ContributionCalendar> {
  try {
    const res = await fetch(`https://github.com/users/${encodeURIComponent(login)}/contributions`, {
      headers: { Accept: "text/html", "User-Agent": USER_AGENT },
    });
    if (!res.ok) return { total: 0, days: [] };
    return parseContributionHtml(await res.text());
  } catch {
    return { total: 0, days: [] };
  }
}

function githubFetch(url: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env["GITHUB_TOKEN"];
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { headers });
}
