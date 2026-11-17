import type { Theme } from "@sigil/core";
import { BUILTIN_THEMES } from "@sigil/core";

export async function listThemes(): Promise<Theme[]> {
  return Object.values(BUILTIN_THEMES) as Theme[];
}
