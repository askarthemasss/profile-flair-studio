/**
 * Card theme shape.
 *
 * A theme is a self-contained color set for a Sigil card pack. Every card in a
 * pack shares one theme. Themes are contributed by pull request.
 */
export type ThemeMode = "dark" | "light";

export interface CardTheme {
  /** Stable id used in URLs: sigil.dev/c/stats/USERNAME?theme=<id> */
  id: string;
  /** Human-readable name shown in the gallery. */
  name: string;
  mode: ThemeMode;
  /** Card background. */
  bg: string;
  /** Primary text / figures. */
  text: string;
  /** Accent — the "heat": numbers, bars, active cells, the rank pip. */
  accent: string;
  /** Lighter accent for gradient ends and highlights. */
  accentGlow: string;
  /** Gold — achievements and rank badges. */
  gold: string;
  /** Secondary text (labels, captions). */
  muted: string;
  /** Thin 1px card border. */
  border: string;
  /** Short feeling note for the gallery caption. */
  feel: string;
}
