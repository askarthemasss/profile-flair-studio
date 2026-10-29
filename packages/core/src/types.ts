import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants / regexes
// ---------------------------------------------------------------------------

export const GITHUB_LOGIN_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// ---------------------------------------------------------------------------
// Card IDs
// ---------------------------------------------------------------------------

export type CardId =
  | "overview"
  | "streak"
  | "languages"
  | "heatmap"
  | "skyline"
  | "activity"
  | "achievements"
  | "repo"
  | "banner";

export const CARD_IDS: CardId[] = [
  "overview",
  "streak",
  "languages",
  "heatmap",
  "skyline",
  "activity",
  "achievements",
  "repo",
  "banner",
];

export const CardIdSchema = z.enum([
  "overview",
  "streak",
  "languages",
  "heatmap",
  "skyline",
  "activity",
  "achievements",
  "repo",
  "banner",
]);

// ---------------------------------------------------------------------------
// Data — what the pipeline stores in GithubSnapshot
// ---------------------------------------------------------------------------

export interface ContributionYear {
  year: number;
  total: number;
  /** days[0] = Jan 1 */
  days: number[];
}

export interface LanguageStat {
  name: string;
  color: string | null;
  bytes: number;
}

export interface RepoStat {
  nameWithOwner: string;
  description: string | null;
  stars: number;
  forks: number;
  language: { name: string; color: string | null } | null;
  pushedAt: string;
  isArchived: boolean;
}

export interface StreakStats {
  current: number;
  currentStart: string | null;
  longest: number;
  longestStart: string | null;
  longestEnd: string | null;
  totalContributions: number;
  activeDays: number;
  busiestDay: { date: string; count: number } | null;
}

export interface GithubSnapshot {
  schema: 1;
  login: string;
  githubId: number;
  name: string | null;
  bio: string | null;
  createdAt: string;
  /** ~96px JPEG, base64, refetched at most daily */
  avatarDataUri: string | null;
  followers: number;
  following: number;
  gists: number;
  organizations: number;
  totals: {
    commits: number;
    prsOpened: number;
    prsMerged: number;
    reviews: number;
    issues: number;
    ownedRepos: number;
    contributedTo: number;
    discussionAnswers: number;
    starsEarned: number;
    forksEarned: number;
    restrictedContributions: number;
  };
  streak: StreakStats;
  years: ContributionYear[];
  /** Aggregated by bytes across owned non-fork repos */
  languages: LanguageStat[];
  /** Top 30 by stars */
  topRepos: RepoStat[];
  fetchedAt: string;
  source: "public_pool";
}

// ---------------------------------------------------------------------------
// Rank
// ---------------------------------------------------------------------------

export type RankTier =
  | "initiate"
  | "apprentice"
  | "journeyman"
  | "adept"
  | "artisan"
  | "virtuoso"
  | "master"
  | "grandmaster"
  | "legend";

export interface RankResult {
  score: number;
  tier: RankTier;
  nextTier: RankTier | null;
  toNext: number;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export type AchievementTier = "bronze" | "silver" | "gold" | "obsidian";
export type AchievementFamily =
  "consistency" | "volume" | "collaboration" | "impact" | "range" | "community";

export interface AchievementDef {
  id: string;
  family: AchievementFamily;
  name: string;
  description: string;
  metric: (s: GithubSnapshot) => number;
  /** bronze, silver, gold, obsidian thresholds */
  thresholds: [number, number, number, number];
}

export interface AchievementState {
  id: string;
  tier: AchievementTier | null;
  value: number;
  nextAt: number | null;
}

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

export const ThemeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/),
  name: z.string().min(2).max(40),
  author: z.string().regex(GITHUB_LOGIN_RE),
  version: z.literal(1),
  mode: z.enum(["dark", "light"]),
  colors: z.object({
    bg: z.string().regex(HEX_RE),
    bgAlt: z.string().regex(HEX_RE),
    border: z.string().regex(HEX_RE),
    text: z.string().regex(HEX_RE),
    textMuted: z.string().regex(HEX_RE),
    accent: z.string().regex(HEX_RE),
    accent2: z.string().regex(HEX_RE),
    success: z.string().regex(HEX_RE),
    warning: z.string().regex(HEX_RE),
    danger: z.string().regex(HEX_RE),
  }),
  heat: z.tuple([
    z.string().regex(HEX_RE),
    z.string().regex(HEX_RE),
    z.string().regex(HEX_RE),
    z.string().regex(HEX_RE),
    z.string().regex(HEX_RE),
  ]),
  font: z.enum(["mono", "sans", "serif"]),
  radius: z.number().int().min(0).max(24),
  effects: z.object({ glow: z.boolean(), grain: z.boolean() }),
});

export type Theme = z.infer<typeof ThemeSchema>;

// ---------------------------------------------------------------------------
// Card params (query string)
// ---------------------------------------------------------------------------

export const CommonParamsSchema = z.object({
  user: z.string().regex(GITHUB_LOGIN_RE),
  theme: z
    .string()
    .regex(/^[a-z0-9-]{2,40}$/)
    .default("obsidian"),
  animate: z.enum(["0", "1"]).default("1"),
  hide_border: z.enum(["0", "1"]).default("0"),
  radius: z.coerce.number().int().min(0).max(24).optional(),
  /** Override, no '#' prefix */
  bg: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/)
    .optional(),
  text: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/)
    .optional(),
  accent: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/)
    .optional(),
});

export type CommonParams = z.infer<typeof CommonParamsSchema>;

export interface CardRenderInput<P = Record<string, unknown>> {
  snapshot: GithubSnapshot;
  theme: Theme;
  params: CommonParams & P;
  now: Date;
}

/** Returns SVG string. Must complete in < 10 ms CPU. */
export type CardRenderer<P = Record<string, unknown>> = (input: CardRenderInput<P>) => string;

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export interface ApiErrorBody {
  code: "BAD_PARAMS" | "NOT_FOUND" | "UPSTREAM";
  message: string;
}
