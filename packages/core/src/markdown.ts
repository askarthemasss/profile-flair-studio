import { BRAND } from "./brand";
import type { CardKind } from "./profile";

export function cardImagePath(options: {
  kind: CardKind;
  username: string;
  themeId: string;
  animate: boolean;
  baseUrl?: string;
}): string {
  const base = (options.baseUrl ?? "").replace(/\/$/, "");
  const animate = options.animate ? "1" : "0";
  return `${base}/c/${options.kind}/${encodeURIComponent(options.username)}?theme=${encodeURIComponent(options.themeId)}&animate=${animate}`;
}

/** The Markdown a developer pastes into a profile README. */
export function sigilMarkdown(options: {
  username: string;
  kinds: CardKind[];
  themeId: string;
  animate: boolean;
  baseUrl?: string;
  staticBackup?: boolean;
}): string {
  const lines = options.kinds.map(
    (kind) =>
      `![Sigil ${kind}](${cardImagePath({ ...options, kind, baseUrl: options.baseUrl ?? BRAND.baseUrl })})`,
  );
  const header = `<!-- ${BRAND.name} — ${BRAND.tagline} -->`;
  const backup = options.staticBackup
    ? "<!-- Static backup: the Sigil GitHub Action commits ./sigil/*.svg -->"
    : "";
  return [header, backup, ...lines].filter(Boolean).join("\n");
}
