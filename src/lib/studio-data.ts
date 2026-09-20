import { DEFAULT_THEME_ID } from "@sigil/core/themes";

/** The nine card kinds, in canonical pack order. */
export type CardKind =
  | "stats"
  | "streak"
  | "languages"
  | "heatmap"
  | "skyline"
  | "activity"
  | "achievements"
  | "repo"
  | "banner";

export const CARD_KINDS: { id: CardKind; name: string; hint: string }[] = [
  { id: "stats", name: "Stats & rank", hint: "Contributions, repos, stars, followers, rank" },
  { id: "streak", name: "Streak", hint: "Current and best day streak" },
  { id: "languages", name: "Languages", hint: "Top languages by share" },
  { id: "heatmap", name: "Contribution heatmap", hint: "26-week contribution grid" },
  { id: "skyline", name: "Isometric skyline", hint: "Contributions as a 3D skyline" },
  { id: "activity", name: "Activity graph", hint: "Weekly commits, last 12 weeks" },
  { id: "achievements", name: "Achievements", hint: "Earned and in-progress badges" },
  { id: "repo", name: "Repo card", hint: "A featured repository" },
  { id: "banner", name: "Banner", hint: "Name, bio, and mark" },
];

export interface SigilProfile {
  username: string;
  name: string;
  bio: string;
  contributions: number;
  repos: number;
  stars: number;
  followers: number;
  rankPercent: number;
  streakCurrent: number;
  streakBest: number;
  languages: { name: string; pct: number }[];
  /** 7 rows × 26 weeks, intensity 0..4. */
  heatmap: number[];
  /** Weekly commit counts, last 12 weeks. */
  activity: number[];
  achievements: { name: string; earned: boolean }[];
  repo: {
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
  };
}

/** Deterministic pseudo-data so the studio preview is stable across SSR/client. */
function buildHeatmap(): number[] {
  const cells: number[] = [];
  for (let i = 0; i < 7 * 26; i++) {
    const v = (Math.sin(i * 1.31) + Math.cos(i * 0.37) + 2) / 4; // 0..1
    if (v < 0.22) cells.push(0);
    else if (v < 0.45) cells.push(1);
    else if (v < 0.68) cells.push(2);
    else if (v < 0.86) cells.push(3);
    else cells.push(4);
  }
  return cells;
}

export const DEMO_PROFILE: SigilProfile = {
  username: "veera-siddhan",
  name: "Veera Siddhan",
  bio: "Systems engineer · Rust, TypeScript, edge runtimes",
  contributions: 14203,
  repos: 212,
  stars: 4812,
  followers: 317,
  rankPercent: 3,
  streakCurrent: 128,
  streakBest: 204,
  languages: [
    { name: "Rust", pct: 46 },
    { name: "TypeScript", pct: 31 },
    { name: "Go", pct: 14 },
    { name: "Python", pct: 9 },
  ],
  heatmap: buildHeatmap(),
  activity: [12, 28, 19, 41, 33, 22, 55, 38, 47, 31, 60, 44],
  achievements: [
    { name: "Commit Marathoner", earned: true },
    { name: "Pairing Warden", earned: true },
    { name: "Reviewer", earned: true },
    { name: "Streakkeeper", earned: true },
    { name: "Open Source Patron", earned: false },
    { name: "Architect", earned: false },
  ],
  repo: {
    name: "veera-siddhan/forgekit",
    description: "Zero-config static SVG cards for your profile. Survives the outage.",
    stars: 1284,
    forks: 84,
    language: "Rust",
  },
};

export interface StudioState {
  username: string;
  themeId: string;
  enabled: Record<CardKind, boolean>;
  animate: boolean;
  staticBackup: boolean;
}

export const DEFAULT_STUDIO: StudioState = {
  username: DEMO_PROFILE.username,
  themeId: DEFAULT_THEME_ID,
  enabled: {
    stats: true,
    streak: true,
    languages: true,
    heatmap: true,
    skyline: true,
    activity: true,
    achievements: true,
    repo: true,
    banner: true,
  },
  animate: true,
  staticBackup: true,
};
