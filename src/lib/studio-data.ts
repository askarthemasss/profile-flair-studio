import { DEMO_PROFILE } from "@sigil/core/demo";
import type { CardKind } from "@sigil/core/profile";
import { DEFAULT_THEME_ID } from "@sigil/core/themes";

export type { CardKind, SigilProfile } from "@sigil/core/profile";
export { DEMO_PROFILE };

export const CARD_KINDS: { id: CardKind; name: string; hint: string }[] = [
  { id: "stats", name: "Stats & rank", hint: "Contributions, repos, stars, followers, rank" },
  { id: "streak", name: "Streak", hint: "Current and best day streak" },
  { id: "languages", name: "Languages", hint: "Top languages by share" },
  { id: "heatmap", name: "Contribution heatmap", hint: "26-week contribution grid" },
  { id: "skyline", name: "Isometric skyline", hint: "Contributions as a 3D skyline" },
  { id: "activity", name: "Activity graph", hint: "Weekly commits, last 12 weeks" },
  { id: "achievements", name: "Achievements", hint: "Earned and in-progress badges" },
  { id: "repo", name: "Repo card", hint: "A featured repository" },
  { id: "banner", name: "Banner", hint: "Name, bio, and mark" },
];

export interface StudioState {
  username: string;
  themeId: string;
  enabled: Record<CardKind, boolean>;
  animate: boolean;
  staticBackup: boolean;
  /** Designed React cards, or the SVG the README actually loads. */
  preview: "studio" | "svg";
}

export const DEFAULT_STUDIO: StudioState = {
  username: DEMO_PROFILE.username,
  themeId: DEFAULT_THEME_ID,
  enabled: {
    stats: true,
    streak: true,
    languages: true,
    heatmap: true,
    skyline: true,
    activity: true,
    achievements: true,
    repo: true,
    banner: true,
  },
  animate: true,
  staticBackup: true,
  preview: "studio",
};
