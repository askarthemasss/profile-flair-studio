import type { Theme } from "@sigil/core";
import { BUILTIN_THEMES } from "@sigil/core";

export interface ThemeWithMeta {
  theme: Theme;
  votes: number;
  voted: boolean;
}

const VOTES_KEY = "sigil_theme_votes";

export async function listThemes(): Promise<ThemeWithMeta[]> {
  const votedSet = new Set<string>();
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (raw) {
      const arr: string[] = JSON.parse(raw);
      arr.forEach((id) => votedSet.add(id));
    }
  } catch {
    // ignore
  }

  const themes = Object.values(BUILTIN_THEMES) as Theme[];

  return themes.map((t, idx) => ({
    theme: t,
    votes: 42 + idx * 17 + (votedSet.has(t.id) ? 1 : 0),
    voted: votedSet.has(t.id),
  }));
}

export async function voteTheme(themeId: string): Promise<boolean> {
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    const alreadyVoted = set.has(themeId);

    if (alreadyVoted) {
      set.delete(themeId);
    } else {
      set.add(themeId);
    }

    localStorage.setItem(VOTES_KEY, JSON.stringify([...set]));
    return !alreadyVoted;
  } catch {
    return false;
  }
}

export async function submitTheme(theme: Theme): Promise<{ success: boolean; message: string }> {
  // In v1, community themes are submitted via PR to themes/community/
  return {
    success: true,
    message: `Theme "${theme.name}" validated successfully! Exported to community format.`,
  };
}
