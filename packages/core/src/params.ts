import { z } from "zod";
import { CommonParamsSchema } from "./types.js";

// ---------------------------------------------------------------------------
// Per-card param schemas (extend CommonParamsSchema)
// ---------------------------------------------------------------------------

export const OverviewParamsSchema = CommonParamsSchema.extend({
  show_rank: z.enum(["0", "1"]).default("1"),
  show_icons: z.enum(["0", "1"]).default("1"),
  count_private: z.enum(["0", "1"]).default("0"),
});

export const StreakParamsSchema = CommonParamsSchema.extend({
  date_format: z.string().max(20).optional(),
  hide_current_streak: z.enum(["0", "1"]).default("0"),
  hide_longest_streak: z.enum(["0", "1"]).default("0"),
});

export const LanguagesParamsSchema = CommonParamsSchema.extend({
  layout: z.enum(["bar", "donut", "compact"]).default("bar"),
  langs_count: z.coerce.number().int().min(1).max(20).default(8),
  hide: z
    .string()
    .optional()
    .transform((v) => v?.split(",").map((s) => s.trim()) ?? []),
  size_weight: z.coerce.number().min(0).max(1).default(0.5),
  count_weight: z.coerce.number().min(0).max(1).default(0.5),
});

export const HeatmapParamsSchema = CommonParamsSchema.extend({
  weeks: z.coerce.number().int().min(12).max(52).default(26),
  show_month_labels: z.enum(["0", "1"]).default("1"),
});

export const SkylineParamsSchema = CommonParamsSchema.extend({
  year: z.coerce.number().int().min(2008).optional(),
});

export const ActivityParamsSchema = CommonParamsSchema.extend({
  weeks: z.coerce.number().int().min(4).max(52).default(12),
  show_dots: z.enum(["0", "1"]).default("0"),
});

export const AchievementsParamsSchema = CommonParamsSchema.extend({
  show_unearned: z.enum(["0", "1"]).default("1"),
  cols: z.coerce.number().int().min(1).max(4).default(3),
});

export const RepoParamsSchema = CommonParamsSchema.extend({
  repo: z.string().min(1).optional(),
  show_description: z.enum(["0", "1"]).default("1"),
  show_stats: z.enum(["0", "1"]).default("1"),
});

export const BannerParamsSchema = CommonParamsSchema.extend({
  show_avatar: z.enum(["0", "1"]).default("1"),
  tagline: z.string().max(120).optional(),
});

export type OverviewParams = typeof OverviewParamsSchema._type;
export type StreakParams = typeof StreakParamsSchema._type;
export type LanguagesParams = typeof LanguagesParamsSchema._type;
export type HeatmapParams = typeof HeatmapParamsSchema._type;
export type SkylineParams = typeof SkylineParamsSchema._type;
export type ActivityParams = typeof ActivityParamsSchema._type;
export type AchievementsParams = typeof AchievementsParamsSchema._type;
export type RepoParams = typeof RepoParamsSchema._type;
export type BannerParams = typeof BannerParamsSchema._type;
