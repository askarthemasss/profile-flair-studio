import { renderCard } from "../cards";
import type { CardKind, SigilProfile } from "../profile";
import { snapshotFromProfile } from "../snapshot";
import type { CardTheme } from "../themes";

export interface RenderCardOptions {
  kind: CardKind;
  profile: SigilProfile;
  theme: CardTheme;
  animate: boolean;
  params?: Record<string, string | undefined>;
  /** Defaults to the profile's `asOf`, so previews stay deterministic. */
  now?: string;
}

/** Profile-shaped entry point used by routes and the studio. */
export function renderCardSvg(options: RenderCardOptions): string {
  const snapshot = snapshotFromProfile(options.profile);
  const now =
    options.now ??
    options.profile.asOf ??
    `${snapshot.days[snapshot.days.length - 1]?.date ?? "2026-01-01"}T12:00:00Z`;
  return renderCard(options.kind, {
    snapshot,
    theme: options.theme,
    now,
    animate: options.animate,
    // The repo card needs ?repo=; profile-shaped callers default to the featured repo.
    params:
      options.kind === "repo" && !options.params?.["repo"]
        ? { ...options.params, repo: options.profile.repo.name }
        : (options.params ?? {}),
  });
}
