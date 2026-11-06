/**
 * Live GitHub data for the studio, fetched directly from the browser.
 *
 * Used when no render Worker is configured (`VITE_RENDER_API_URL` unset). It
 * relies on GitHub's public unauthenticated endpoints plus a CORS-enabled
 * contributions service; everything serves `Access-Control-Allow-Origin: *`:
 *
 * - `GET api.github.com/users/:login/repos` for repositories, walked through
 *   the `Link: rel="next"` chain (up to 1,000 own repos) and sorted by stars
 *   here, because the list endpoint cannot sort by stars.
 * - `GET github-contributions-api.jogruber.de/v4/:login?y=all` for the
 *   contribution calendar, which the GitHub GraphQL API would need a token for.
 * - `GET api.github.com/search/commits` with `repo:` qualifiers for the top own
 *   repositories and `author:login`, giving an attributed, commit-only
 *   `totals.commits` (the commits list endpoint cannot expose a last page when
 *   filtered by author, and an unfiltered repository history would include
 *   collaborators' commits).
 * - `GET api.github.com/search/issues` for lifetime PR, merged-PR, and issue
 *   counts.
 * - `GET api.github.com/users/:login/events/public` (up to 300 events, about
 *   the last 90 days) for review submissions and the set of repositories
 *   contributed to.
 *
 * Unauthenticated budgets: 60 core requests/hour/IP and 10 searches/minute/IP.
 * A typical lookup costs about 7 core requests (profile, one repository page,
 * up to three event pages, and gist/org counts) plus four searches (three
 * issue counts and one commit count). `useSnapshot` debounces typing and
 * aborts superseded lookups, and `snapshot-service.ts` caches results for 10
 * minutes, so normal browsing stays under the limits. Counters GitHub cannot
 * hand back unauthenticated (`discussionAnswers`, the restricted-contribution
 * split) stay at zero rather than being invented.
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

interface PublicEvent {
  type?: string;
  repo: { name: string } | null;
}

async function ghJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_ROOT}${path}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
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

async function searchCount(query: string, login: string, signal?: AbortSignal): Promise<number> {
  const q = new URLSearchParams();
  q.set("q", `${query}:${login}`);
  q.set("per_page", "1");

  try {
    const body = await ghJson<SearchCount>(`/search/issues?${q.toString()}`, signal);
    return body.total_count ?? 0;
  } catch (error) {
    if (signal?.aborted) throw error;
    // Search has a much tighter budget than core; a failed search zeroes one
    // counter instead of costing the whole snapshot. Rate limiting is the
    // exception: without it the counters would silently read as zero.
    if (error instanceof SnapshotError && error.kind === "rate_limit") {
      throw new SnapshotError("rate_limit", "GitHub request limit reached, try again later", 403);
    }
    return 0;
  }
}

async function ghListCount(path: string, signal?: AbortSignal): Promise<number> {
  try {
    const res = await fetch(`${API_ROOT}${path}?per_page=1`, {
      headers: { Accept: "application/vnd.github+json" },
      signal,
    });
    if (!res.ok) return 0;

    // List endpoints paginate instead of returning `x-total-count`; the
    // `rel="last"` page number is the item count at per_page=1.
    const last = /page=(\d+)>; rel="last"/.exec(res.headers.get("link") ?? "");
    if (last) return Number(last[1]);

    // A single page: the body length is the count (0 or 1 at per_page=1).
    const body = (await res.json()) as unknown;
    return Array.isArray(body) ? body.length : 0;
  } catch (error) {
    if (signal?.aborted) throw error;
    return 0;
  }
}

async function fetchContributions(login: string, signal?: AbortSignal): Promise<ContribResponse> {
  let res: Response;
  try {
    res = await fetch(`${CONTRIB_API_ROOT}/${encodeURIComponent(login.toLowerCase())}?y=all`, {
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
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

/**
 * Follows the `Link: rel="next"` chain on `/users/:login/repos` until no more
 * pages are handed out, so the top-by-stars selection sees every own repo
 * rather than just the most recently pushed hundred. The cap bounds what a
 * single lookup can spend (10 pages = up to 1,000 own repos) to respect the
 * 60/hour unauthenticated budget; profiles beyond the cap only undercount
 * their own numbers, they do not fail.
 */
const REPO_PAGE_CAP = 10;

async function fetchOwnedRepos(handle: string, signal?: AbortSignal): Promise<GithubRepo[]> {
  const all: GithubRepo[] = [];

  for (let page = 1; page <= REPO_PAGE_CAP; page++) {
    let res: Response;
    try {
      res = await fetch(`${API_ROOT}/users/${handle}/repos?per_page=100&sort=pushed&page=${page}`, {
        signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
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

    const body = (await res.json()) as GithubRepo[];
    if (!Array.isArray(body) || body.length === 0) break;
    all.push(...body);

    if (!(res.headers.get("link") ?? "").includes('rel="next"')) break;
  }

  return all;
}

/**
 * The public events feed is capped by GitHub at 300 events covering roughly
 * the last 90 days, so three pages is the whole available window. It is the
 * only unauthenticated source for review submissions and contributed-to
 * repositories.
 */
const EVENTS_PAGE_CAP = 3;

async function fetchPublicEvents(handle: string, signal?: AbortSignal): Promise<PublicEvent[]> {
  const all: PublicEvent[] = [];

  for (let page = 1; page <= EVENTS_PAGE_CAP; page++) {
    try {
      const res = await fetch(
        `${API_ROOT}/users/${handle}/events/public?per_page=100&page=${page}`,
        {
          headers: { Accept: "application/vnd.github+json" },
          signal,
        },
      );
      if (!res.ok) break;

      const body = (await res.json()) as PublicEvent[];
      if (!Array.isArray(body) || body.length === 0) break;
      all.push(...body);
      if (body.length < 100) break;
    } catch (error) {
      if (signal?.aborted) throw error;
      break;
    }
  }

  return all;
}

/**
 * The login's commit count across the top own repositories, attributed with
 * `author:` in a single search request.
 *
 * The commits list endpoint supports `author=`, but GitHub does not attach a
 * `rel="last"` page to author-filtered commit lists, so counting that way
 * would mean walking every page. Commit search returns the exact
 * `total_count` and accepts multiple `repo:` qualifiers, which keeps the
 * lookup at one search request.
 */
const COMMITS_REPO_LIMIT = 15;

async function searchCommitCount(
  login: string,
  repos: GithubRepo[],
  signal?: AbortSignal,
): Promise<number> {
  if (repos.length === 0) return 0;

  const qualifiers = repos.map((r) => `repo:${r.full_name}`).join(" ");
  const q = new URLSearchParams();
  q.set("q", `${qualifiers} author:${login}`);
  q.set("per_page", "1");

  try {
    const body = await ghJson<SearchCount>(`/search/commits?${q.toString()}`, signal);
    return body.total_count ?? 0;
  } catch (error) {
    if (signal?.aborted) throw error;
    // A failed commit search leaves the commit total at zero rather than
    // failing the profile; the other cards still have live data.
    if (error instanceof SnapshotError && error.kind === "rate_limit") {
      throw new SnapshotError("rate_limit", "GitHub request limit reached, try again later", 403);
    }
    return 0;
  }
}

/**
 * Weighs each repo's primary language equally; shares land in the right order.
 */
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

async function fetchAvatarDataUri(url: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    return null;
  }
}

async function fetchLiveProfile(login: string, signal?: AbortSignal): Promise<GithubSnapshot> {
  const now = new Date();
  const handle = encodeURIComponent(login.toLowerCase());

  // 1. Profile and, if the login has more than a thousand own repositories,
  //    every one of the pages before the cap.
  const user = await ghJson<GithubUser>(`/users/${handle}`, signal);
  const repos = await fetchOwnedRepos(handle, signal);
  const owned = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);

  // 2. Lifetime counters. Three searches, plus the public events feed for
  //    review submissions and contributed-to repositories.
  const [prsOpened, prsMerged, issues, events, gists, orgs] = await Promise.all([
    searchCount("is:pr author", login, signal),
    searchCount("is:pr is:merged author", login, signal),
    searchCount("is:issue author", login, signal),
    fetchPublicEvents(handle, signal),
    ghListCount(`/users/${handle}/gists`, signal),
    ghListCount(`/users/${handle}/orgs`, signal),
  ]);

  // 3. Contribution history, latest three years that have any data.
  const contribs = await fetchContributions(login, signal);

  // Contributions to other people's repositories: keep the feed to genuine
  // contribution events, and cut out the user's own namespace the way
  // GitHub's profile "Contributed to" count does.
  const CONTRIBUTION_EVENT_TYPES = new Set([
    "PushEvent",
    "PullRequestEvent",
    "PullRequestReviewEvent",
    "IssueCommentEvent",
    "IssuesEvent",
    "CommitCommentEvent",
    "GollumEvent",
  ]);
  // Review submissions, not PRs that were reviewed: `reviewed-by:` matches a
  // PR once no matter how many reviews it received. The events feed covers
  // roughly 90 days and is capped at 300 events, so this is a recent lower
  // bound; the Worker path uses GraphQL's lifetime total.
  const reviews = events.filter((e) => e.type === "PullRequestReviewEvent").length;

  const ownPrefix = `${login.toLowerCase()}/`;
  const publicEvents = events;
  const contributedTo = new Set(
    publicEvents
      .filter(
        (e) =>
          CONTRIBUTION_EVENT_TYPES.has(e.type ?? "") &&
          e.repo?.name &&
          !e.repo.name.toLowerCase().startsWith(ownPrefix),
      )
      .map((e) => e.repo!.name),
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

  // Streaks follow the Worker's rolling 52-week window (the GraphQL
  // contribution calendar), not a calendar year: splitting by year would drop
  // the December days before January 1 and break a streak crossing the new
  // year. The window ends today and starts 364 days earlier, inclusive.
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const windowStart = new Date(today);
  windowStart.setUTCDate(windowStart.getUTCDate() - 364);
  const windowStartIso = windowStart.toISOString().slice(0, 10);
  const todayIso = today.toISOString().slice(0, 10);
  const streakDays = contribs.contributions
    .filter((d) => d.date >= windowStartIso && d.date <= todayIso)
    .map((d) => ({ date: d.date, count: d.count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 4. Commits are attributed to this login with `author:` across the top own
  //    repositories, in one commit-search request. Unauthenticated GitHub
  //    cannot answer "commits by this author, lifetime, all repositories":
  //    commit search needs repo qualifiers, and calendars lump commits with
  //    PRs and issues. This is an author-attributed lower bound because
  //    repositories outside the top set are not visited.
  const commitRepos = owned.slice(0, COMMITS_REPO_LIMIT);
  const commits = await searchCommitCount(login, commitRepos, signal);

  // 5. Avatar as an embeddable data URI, best effort.
  const avatarDataUri = user.avatar_url ? await fetchAvatarDataUri(user.avatar_url, signal) : null;

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
      commits,
      prsOpened,
      prsMerged,
      reviews,
      issues,
      ownedRepos: owned.length,
      contributedTo,
      discussionAnswers: 0,
      starsEarned: owned.reduce((sum, r) => sum + r.stargazers_count, 0),
      forksEarned: owned.reduce((sum, r) => sum + r.forks_count, 0),
      restrictedContributions: 0,
    },
    streak: computeStreak(streakDays),
    years,
    languages: aggregateLanguages(owned),
    topRepos: toRepoStats(owned, 30),
    fetchedAt: now.toISOString(),
    source: "public_pool",
  };
}

export { fetchLiveProfile };
