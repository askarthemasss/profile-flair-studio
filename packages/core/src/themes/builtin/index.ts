import type { CardTheme } from "../types";
import { obsidian } from "./obsidian";
import { paper } from "./paper";
import { verdigris } from "./verdigris";
import { monolith } from "./monolith";
import { tidepool } from "./tidepool";
import { sandstone } from "./sandstone";

/** The six themes that ship in v1, in gallery order. */
export const BUILTIN_THEMES: CardTheme[] = [
  obsidian,
  paper,
  verdigris,
  monolith,
  tidepool,
  sandstone,
];

/** Resolve a theme by id, falling back to the default (Obsidian). */
export function getTheme(id: string): CardTheme {
  return BUILTIN_THEMES.find((t) => t.id === id) ?? obsidian;
}

export const DEFAULT_THEME_ID = obsidian.id;
