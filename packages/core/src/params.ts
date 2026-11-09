import { z } from "zod";
import { CommonParamsSchema, type CardId } from "./types.js";

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
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    ),
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

/**
 * Schema for each card kind. The render route validates with the matching
 * schema so defaults, numeric coercion, and list transforms actually apply.
 */
export const CARD_PARAM_SCHEMAS = {
  overview: OverviewParamsSchema,
  streak: StreakParamsSchema,
  languages: LanguagesParamsSchema,
  heatmap: HeatmapParamsSchema,
  skyline: SkylineParamsSchema,
  activity: ActivityParamsSchema,
  achievements: AchievementsParamsSchema,
  repo: RepoParamsSchema,
  banner: BannerParamsSchema,
} as const satisfies Record<CardId, z.ZodTypeAny>;

export type OverviewParams = z.infer<typeof OverviewParamsSchema>;
export type StreakParams = z.infer<typeof StreakParamsSchema>;
export type LanguagesParams = z.infer<typeof LanguagesParamsSchema>;
export type HeatmapParams = z.infer<typeof HeatmapParamsSchema>;
export type SkylineParams = z.infer<typeof SkylineParamsSchema>;
export type ActivityParams = z.infer<typeof ActivityParamsSchema>;
export type AchievementsParams = z.infer<typeof AchievementsParamsSchema>;
export type RepoParams = z.infer<typeof RepoParamsSchema>;
export type BannerParams = z.infer<typeof BannerParamsSchema>;
