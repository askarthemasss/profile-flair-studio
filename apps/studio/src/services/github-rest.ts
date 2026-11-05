/**
 * Live GitHub data for the studio, fetched directly from the browser.
 *
 * Used when no render Worker is configured (`VITE_RENDER_API_URL` unset). It
 * relies on GitHub's public unauthenticated endpoints plus a CORS-enabled
 * contributions service; everything serves `Access-Control-Allow-Origin: *`:
 *
 * - `GET api.github.com/users/:login` and `:login/repos` for the profile.
 * - `GET github-contributions-api.jogruber.de/v4/:login?y=all` for the
 *   contribution calendar, which GitHub's GraphQL API would need a token for.
 * - `GET api.github.com/search/issues` for lifetime PR, merged-PR, issue, and
 *   review counts.
 * - `GET api.github.com/users/:login/events/public` for the set of repos
 *   contributed to (the events feed covers roughly the last 90 days).
 *
 * Unauthenticated budgets: 60 core requests/hour/IP and 10 searches/minute/IP.
 * A lookup costs about 6 core requests and 4 searches, and
 * `snapshot-service.ts` caches results, so normal browsing stays under it.
 * Counters GitHub cannot hand back unauthenticated (`discussionAnswers`,
 * the restricted-contribution split) stay at zero rather than being invented.
 */
import type { ContributionYear, GithubSnapshot, LanguageStat, RepoStat } from "@sigil/core";
import { buildContributionYear, computeStreak, type RawContributionCalendar } from "@sigil/core";

export class SnapshotError extends Error {
  kind: "not_found" | "rate_limit" | "unauthenticated" | "network" | "upstream";
  status?: number;

  constructor(kind: SnapshotError["kind"], message: string, status?: number) {
    super(message);
    this.name = "SnapshotError";
    this.kind = kind;
    this.status = status;
  }
}

const API_ROOT = "https://api.github.com";
const CONTRIB_API_ROOT = "https://github-contributions-api.jogruber.de/v4";

/**
 * Language colors, a static copy of GitHub's own linguist palette for the
 * languages likely to appear here. A name without an entry renders with the
 * theme's fallback color, exactly as `null` does from the GraphQL path.
 */
const LANG_COLORS: Record<string, string> = {
  Assembly: "#6E4C13",
  Batchfile: "#C1F12E",
  C: "#555555",
  "C#": "#178600",
  "C++": "#f34b7d",
  Clojure: "#db5855",
  Crystal: "#000100",
  CSS: "#663399",
  Cython: "#fedf5b",
  Dart: "#00B4AB",
  Dockerfile: "#384d54",
  Elixir: "#6e4a7e",
  Elm: "#60B5CC",
  Erlang: "#B83998",
  "F#": "#b845fc",
  Fortran: "#4d41b1",
  GDScript: "#355570",
  Go: "#00ADD8",
  Groovy: "#4298b8",
  Haskell: "#5e5086",
  Handlebars: "#f7931e",
  HCL: "#844FBA",
  HTML: "#e34c26",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  JSON: "#292929",
  Julia: "#a270ba",
  "Jupyter Notebook": "#DA5B0B",
  Kotlin: "#A97BFF",
  Lua: "#000080",
  MATLAB: "#e16737",
  Makefile: "#427819",
  Markdown: "#083fa5",
  Nim: "#ffc200",
  Nix: "#7e7eff",
  "Objective-C": "#438eff",
  OCaml: "#3be133",
  Pascal: "#b0ce4e",
  Perl: "#0298c3",
  PHP: "#4F5D95",
  PowerShell: "#012456",
  Prolog: "#74283c",
  Python: "#3572A5",
  R: "#198CE7",
  Raku: "#0000fb",
  Ruby: "#701516",
  Rust: "#dea584",
  Scala: "#c22d40",
  Scheme: "#1e4aec",
  Shell: "#89e051",
  Smalltalk: "#596706",
  Solidity: "#AA6746",
  SQL: "#e38c00",
  Svelte: "#ff3e00",
  SVG: "#ff9900",
  Swift: "#F05138",
  Tcl: "#e4cc98",
  TeX: "#3D6117",
  TypeScript: "#3178c6",
  "Vim Script": "#199f4b",
  "Visual Basic .NET": "#945db7",
  Vue: "#41b883",
  WebAssembly: "#041B37",
  XML: "#0060ac",
  YAML: "#cb171e",
  Zig: "#ec915c",
};

interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  bio: string | null;
  created_at: string;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
}

interface GithubRepo {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
}

interface SearchCount {
  total_count: number;
}

interface ContribDay {
  date: string;
  count: number;
}

interface ContribResponse {
  total: Record<string, number>;
  contributions: ContribDay[];
}

async function ghJson<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_ROOT}${path}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
  } catch {
    throw new SnapshotError("network", "Could not reach api.github.com", 0);
  }

  if (res.status === 404) {
    throw new SnapshotError("not_found", "No GitHub user with that login", 404);
  }
  if (res.status === 403) {
    if (res.headers.get("x-ratelimit-remaining") === "0") {
      throw new SnapshotError("rate_limit", "GitHub request limit reached, try again later", 403);
    }
    throw new SnapshotError("unauthenticated", "GitHub refused the request (403)", 403);
  }
  if (!res.ok) {
    throw new SnapshotError("upstream", `GitHub responded with ${res.status}`, res.status);
  }

  return (await res.json()) as T;
}

async function searchCount(query: string, login: string): Promise<number> {
  const q = new URLSearchParams();
  q.set("q", `${query}:${login}`);
  q.set("per_page", "1");

  try {
    const body = await ghJson<SearchCount>(`/search/issues?${q.toString()}`);
    return body.total_count ?? 0;
  } catch (error) {
    // Search has a much tighter budget than core; a failed search zeroes one
    // counter instead of costing the whole snapshot. Rate limiting is the
    // exception: without it the counters would silently read as zero.
    if (error instanceof SnapshotError && error.kind === "rate_limit") {
      throw new SnapshotError("rate_limit", "GitHub request limit reached, try again later", 403);
    }
    return 0;
  }
}

async function ghCount(path: string): Promise<number> {
  try {
    const res = await fetch(`${API_ROOT}${path}?per_page=1`);
    const total = Number(res.headers.get("x-total-count"));
    return Number.isFinite(total) && total > 0 ? total : 0;
  } catch {
    return 0;
  }
}

async function fetchContributions(login: string): Promise<ContribResponse> {
  let res: Response;
  try {
    res = await fetch(`${CONTRIB_API_ROOT}/${encodeURIComponent(login.toLowerCase())}?y=all`);
  } catch {
    throw new SnapshotError("network", "Could not reach the contributions service", 0);
  }
  if (!res.ok) {
    throw new SnapshotError(
      "upstream",
      `Contributions service responded with ${res.status}`,
      res.status,
    );
  }
  return (await res.json()) as ContribResponse;
}

/** Weighs each repo's primary language equally; shares land in the right order. */
function aggregateLanguages(repos: GithubRepo[]): LanguageStat[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language || repo.fork) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, color: LANG_COLORS[name] ?? null, bytes: count }))
    .sort((a, b) => b.bytes - a.bytes);
}

function toRepoStats(repos: GithubRepo[], limit: number): RepoStat[] {
  return repos.slice(0, limit).map((r) => ({
    nameWithOwner: r.full_name,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language ? { name: r.language, color: LANG_COLORS[r.language] ?? null } : null,
    pushedAt: r.pushed_at,
    isArchived: r.archived,
  }));
}

/**
 * Turns the flat per-day list for one calendar year into the `days[]` shape the
 * cards read, reusing the Worker's trimming (the current year ends today).
 */
function buildYear(year: number, days: ContribDay[], now: Date): ContributionYear | null {
  const calendar: RawContributionCalendar = {
    totalContributions: days.reduce((sum, d) => sum + d.count, 0),
    // The weights below are derived from each day's date only, so funneling the
    // whole year into a single week keeps the mapping identical.
    weeks: [
      {
        contributionDays: days.map((d) => ({ date: d.date, contributionCount: d.count })),
      },
    ],
  };
  return buildContributionYear(year, calendar, now);
}

function selectYears(available: number[], now: Date): number[] {
  const current = now.getUTCFullYear();
  const years = [...new Set(available)]
    .filter((y) => Number.isInteger(y) && y > 0 && y <= current)
    .sort((a, b) => b - a)
    .slice(0, 3);
  return years.sort((a, b) => a - b);
}

async function fetchAvatarDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function fetchLiveProfile(login: string): Promise<GithubSnapshot> {
  const now = new Date();
  const handle = encodeURIComponent(login.toLowerCase());

  // 1. Profile and own repositories; a login with more than 100 of them still
  //    gets a full top-30 by stars from this page.
  const user = await ghJson<GithubUser>(`/users/${handle}`);
  const repos = await ghJson<GithubRepo[]>(`/users/${handle}/repos?per_page=100&sort=pushed`);
  const owned = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);

  // 2. Lifetime counters. Four searches; each failure zeroes just its counter.
  const [prsOpened, prsMerged, reviews, issues, events, gists, orgs] = await Promise.all([
    searchCount("is:pr author", login),
    searchCount("is:pr is:merged author", login),
    searchCount("is:pr reviewed-by", login),
    searchCount("is:issue author", login),
    ghJson<Array<{ repo: { name: string } | null }>>(
      `/users/${handle}/events/public?per_page=100`,
    ).catch(() => []),
    ghCount(`/users/${handle}/gists`),
    ghCount(`/users/${handle}/orgs`),
  ]);

  // 3. Contribution history, latest three years that have any data.
  const contribs = await fetchContributions(login);
  const publicEvents = Array.isArray(events) ? events : [];
  const contributedTo = new Set(
    publicEvents.map((e) => e.repo?.name).filter((n): n is string => Boolean(n)),
  ).size;

  const years = selectYears(
    Object.keys(contribs.total ?? {}).map((y) => Number(y)),
    now,
  )
    .map((year) =>
      buildYear(
        year,
        contribs.contributions.filter((d) => Number(d.date.slice(0, 4)) === year),
        now,
      ),
    )
    .filter((y): y is ContributionYear => y !== null);

  // The most recent year drives the headline counters; the current calendar
  // year is skipped on the path where GitHub has nothing yet for it.
  const latest = years[years.length - 1] ?? null;
  const latestDays = latest
    ? contribs.contributions
        .filter((d) => Number(d.date.slice(0, 4)) === latest.year)
        .map((d) => ({ date: d.date, count: d.count }))
    : [];

  // 4. Avatar as an embeddable data URI, best effort.
  const avatarDataUri = user.avatar_url ? await fetchAvatarDataUri(user.avatar_url) : null;

  return {
    schema: 1,
    login: user.login,
    githubId: user.id,
    name: user.name,
    bio: user.bio,
    createdAt: user.created_at,
    avatarDataUri,
    followers: user.followers,
    following: user.following,
    gists,
    organizations: orgs,
    totals: {
      commits: latest?.total ?? 0,
      prsOpened,
      prsMerged,
      reviews,
      issues,
      ownedRepos: user.public_repos,
      contributedTo,
      discussionAnswers: 0,
      starsEarned: owned.reduce((sum, r) => sum + r.stargazers_count, 0),
      forksEarned: owned.reduce((sum, r) => sum + r.forks_count, 0),
      restrictedContributions: 0,
    },
    streak: computeStreak(latestDays),
    years,
    languages: aggregateLanguages(owned),
    topRepos: toRepoStats(owned, 30),
    fetchedAt: now.toISOString(),
    source: "public_pool",
  };
}

export { fetchLiveProfile };
