/** Public surface of @sigil/core */

export * from "./brand.js";
export * from "./color.js";
export * from "./types.js";
export * from "./params.js";

// Stats modules
export * from "./stats/rank.js";
export * from "./stats/streak.js";
export * from "./stats/achievements-defs.js";
export * from "./stats/languages.js";

// SVG builder and helpers
export * from "./svg/builder.js";
export * from "./svg/escape.js";
export * from "./svg/animations.js";

// Themes
export * from "./themes/index.js";

// GitHub
export * from "./github/queries.js";
export * from "./github/normalize.js";

// Card renderers
export { renderOverview } from "./cards/overview.js";
export { renderStreak } from "./cards/streak.js";
export { renderLanguages } from "./cards/languages.js";
export { renderHeatmap } from "./cards/heatmap.js";
export { renderSkyline } from "./cards/skyline.js";
export { renderActivity } from "./cards/activity.js";
export { renderAchievements } from "./cards/achievements.js";
export { renderRepo } from "./cards/repo.js";
export { renderBanner } from "./cards/banner.js";

import type { CardId, CardRenderer } from "./types.js";
import { renderOverview } from "./cards/overview.js";
import { renderStreak } from "./cards/streak.js";
import { renderLanguages } from "./cards/languages.js";
import { renderHeatmap } from "./cards/heatmap.js";
import { renderSkyline } from "./cards/skyline.js";
import { renderActivity } from "./cards/activity.js";
import { renderAchievements } from "./cards/achievements.js";
import { renderRepo } from "./cards/repo.js";
import { renderBanner } from "./cards/banner.js";

export const CARD_RENDERERS: Record<CardId, CardRenderer<any>> = {
  overview: renderOverview,
  streak: renderStreak,
  languages: renderLanguages,
  heatmap: renderHeatmap,
  skyline: renderSkyline,
  activity: renderActivity,
  achievements: renderAchievements,
  repo: renderRepo,
  banner: renderBanner,
};
