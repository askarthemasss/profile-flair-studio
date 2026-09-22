import { heatmapLevels, streaks, weeklyCounts, type ContributionDay } from "./contributions";
import { ACTIVITY_WEEKS, HEATMAP_WEEKS, type SigilProfile } from "./profile";
import { estimateRankPercent } from "./rank";

export interface RepoStats {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  fork: boolean;
}

export interface ProfileParts {
  login: string;
  name: string | null;
  bio: string | null;
  followers: number;
  publicRepos: number;
  repos: RepoStats[];
  contributionsTotal: number;
  days: ContributionDay[];
  /** ISO date (YYYY-MM-DD) the windows are aligned to. */
  today: string;
  /** Shown when GitHub answered with nothing useful (rate limit, outage). */
  note?: string;
}

const ACHIEVEMENTS: {
  name: string;
  earned: (
    profile: Pick<SigilProfile, "contributions" | "streakBest" | "stars" | "repos">,
  ) => boolean;
}[] = [
  { name: "Commit Marathoner", earned: (p) => p.contributions >= 1000 },
  { name: "Streakkeeper", earned: (p) => p.streakBest >= 30 },
  { name: "Open Source Patron", earned: (p) => p.stars >= 100 },
  { name: "Architect", earned: (p) => p.repos >= 25 },
];

export function buildProfile(parts: ProfileParts): SigilProfile {
  const owned = parts.repos.filter((repo) => !repo.fork);
  const stars = owned.reduce((sum, repo) => sum + Math.max(0, repo.stars), 0);
  const featured = [...(owned.length > 0 ? owned : parts.repos)].sort(
    (a, b) => b.stars - a.stars,
  )[0];
  const streak = streaks(parts.days, parts.today);
  const contributions = Math.max(0, parts.contributionsTotal);

  const profile: SigilProfile = {
    username: parts.login,
    name: clean(parts.name) || parts.login,
    bio: clean(parts.note) || clean(parts.bio) || "GitHub profile",
    contributions,
    repos: Math.max(0, parts.publicRepos),
    stars,
    followers: Math.max(0, parts.followers),
    rankPercent: 99,
    streakCurrent: streak.current,
    streakBest: streak.best,
    languages: languageShares(owned),
    heatmap: heatmapLevels(parts.days, parts.today, HEATMAP_WEEKS),
    activity: weeklyCounts(parts.days, parts.today, ACTIVITY_WEEKS),
    achievements: [],
    repo: featured
      ? {
          name: `${parts.login}/${featured.name}`,
          description: clean(featured.description) || "No description",
          stars: Math.max(0, featured.stars),
          forks: Math.max(0, featured.forks),
          language: featured.language || "—",
        }
      : {
          name: parts.login,
          description: "No public repository yet",
          stars: 0,
          forks: 0,
          language: "—",
        },
  };

  profile.rankPercent = estimateRankPercent(profile);
  profile.achievements = ACHIEVEMENTS.map((badge) => ({
    name: badge.name,
    earned: badge.earned(profile),
  }));
  return profile;
}

/** A calm card when the login does not exist. Never a rate-limit error. */
export function missingProfile(login: string): SigilProfile {
  return buildProfile({
    login,
    name: login,
    bio: null,
    followers: 0,
    publicRepos: 0,
    repos: [],
    contributionsTotal: 0,
    days: [],
    today: new Date().toISOString().slice(0, 10),
    note: "No public GitHub profile",
  });
}

/** A calm card when GitHub is quiet and we have nothing cached. */
export function waitingProfile(login: string): SigilProfile {
  return buildProfile({
    login,
    name: login,
    bio: null,
    followers: 0,
    publicRepos: 0,
    repos: [],
    contributionsTotal: 0,
    days: [],
    today: new Date().toISOString().slice(0, 10),
    note: "Stats refresh when GitHub answers",
  });
}

function languageShares(repos: RepoStats[]): { name: string; pct: number }[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const total = ranked.reduce((sum, [, count]) => sum + count, 0);
  if (total === 0) return [];
  const rows = ranked.map(([name, count]) => ({
    name,
    pct: Math.round((count / total) * 100),
  }));
  const drift = 100 - rows.reduce((sum, row) => sum + row.pct, 0);
  const first = rows[0];
  if (first && drift !== 0) first.pct += drift;
  return rows;
}

function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}
