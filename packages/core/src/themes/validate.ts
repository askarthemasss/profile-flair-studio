import { contrastRatio } from "../color";
import { BUILTIN_THEMES } from "./builtin";
import type { CardTheme } from "./types";

export interface ThemeViolation {
  themeId: string;
  pair: "text" | "muted" | "accent" | "gold";
  ratio: number;
  minimum: number;
}

/**
 * CI rule: text and muted text on the card background at least 4.5:1,
 * accent and gold at least 3:1. Muted and gold are real card text
 * (captions and badges), so they are held to the same bars.
 */
export function themeViolations(themes: CardTheme[] = BUILTIN_THEMES): ThemeViolation[] {
  const violations: ThemeViolation[] = [];
  for (const theme of themes) {
    check(violations, theme, "text", theme.text, 4.5);
    check(violations, theme, "muted", theme.muted, 4.5);
    check(violations, theme, "accent", theme.accent, 3);
    check(violations, theme, "gold", theme.gold, 3);
  }
  return violations;
}

function check(
  violations: ThemeViolation[],
  theme: CardTheme,
  pair: ThemeViolation["pair"],
  foreground: string,
  minimum: number,
): void {
  const ratio = contrastRatio(foreground, theme.bg);
  if (ratio + 1e-9 < minimum) {
    violations.push({ themeId: theme.id, pair, ratio, minimum });
  }
}
