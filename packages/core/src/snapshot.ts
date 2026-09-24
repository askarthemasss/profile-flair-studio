import type { SigilProfile } from "./profile";

/** The compact per-login data every card renders from. */
export interface CardSnapshot {
  login: string;
  name: string;
  bio: string;
  /** Pre-fetched `data:image/...;base64,` avatar. Absent → monogram. */
  avatarDataUri?: string;
  stats: {
    commits: number;
    prsMerged: number;
    reviews: number;
    issues: number;
    stars: number;
    followers: number;
    contributions: number;
    repos: number;
  };
  rank: { percent: number; tier: string; score: number };
  /** Daily counts, oldest first, ISO dates. */
  days: { date: string; count: number }[];
  /** Languages by bytes (or best available weight). */
  languages: { name: string; bytes: number }[];
  /** Top 30 owned repositories by stars. Cards never fetch outside this. */
  topRepos: {
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    pushedAt: string | null;
  }[];
}

const TIERS: [number, string][] = [
  [1, "Obsidian"],
  [5, "Gold"],
  [12.5, "Ember"],
  [25, "Copper"],
  [50, "Iron"],
  [101, "Stone"],
];

export function rankTier(percent: number): { tier: string; score: number } {
  const p = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 100));
  const tier = TIERS.find(([limit]) => p <= limit)?.[1] ?? "Stone";
  return { tier, score: Math.round(100 - p) };
}

/** Adapt the profile the pipeline stores into the card snapshot. */
export function snapshotFromProfile(profile: SigilProfile): CardSnapshot {
  const days = profile.days ?? [];
  const languages =
    profile.languageBytes ??
    profile.languages.map((language) => ({ name: language.name, bytes: language.pct }));
  const topRepos = profile.topRepos ?? [
    { ...profile.repo, pushedAt: null },
  ];
  const n = (value: number | undefined) => Math.max(0, Number.isFinite(value) ? (value as number) : 0);
  return {
    login: profile.username,
    name: profile.name,
    bio: profile.bio,
    ...(profile.avatarDataUri ? { avatarDataUri: profile.avatarDataUri } : {}),
    stats: {
      commits: n(profile.commits ?? profile.contributions),
      prsMerged: n(profile.prsMerged),
      reviews: n(profile.reviews),
      issues: n(profile.issues),
      stars: n(profile.stars),
      followers: n(profile.followers),
      contributions: n(profile.contributions),
      repos: n(profile.repos),
    },
    rank: { percent: profile.rankPercent, ...rankTier(profile.rankPercent) },
    days,
    languages,
    topRepos: topRepos.filter((repo) => repo.name && repo.name.includes("/")).slice(0, 30),
  };
}
