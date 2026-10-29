import type { Theme } from "../types.js";
import obsidianJson from "./builtin/obsidian.json";
import monolithJson from "./builtin/monolith.json";
import verdigrisJson from "./builtin/verdigris.json";

export const BUILTIN_THEMES: Record<string, Theme> = {
  obsidian: obsidianJson as Theme,
  monolith: monolithJson as Theme,
  verdigris: verdigrisJson as Theme,
};

export const DEFAULT_THEME: Theme = BUILTIN_THEMES.obsidian!;

/**
 * Resolves a theme by ID with optional color overrides.
 *
 * @param themeId The theme identifier (e.g. 'obsidian', 'monolith')
 * @param overrides Optional partial color overrides
 * @returns Fully resolved Theme object
 */
export function resolveTheme(
  themeId?: string,
  overrides?: Partial<Theme["colors"]>,
): Theme {
  const baseTheme = (themeId && BUILTIN_THEMES[themeId]) ? BUILTIN_THEMES[themeId] : DEFAULT_THEME;

  if (!overrides || Object.keys(overrides).length === 0) {
    return baseTheme;
  }

  // Filter out undefined or empty overrides
  const cleanOverrides: Partial<Theme["colors"]> = {};
  for (const [k, v] of Object.entries(overrides)) {
    if (v) {
      // Ensure leading '#'
      cleanOverrides[k as keyof Theme["colors"]] = v.startsWith("#") ? v : `#${v}`;
    }
  }

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...cleanOverrides,
    },
  };
}
