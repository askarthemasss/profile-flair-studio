import type { CardId, GithubSnapshot, Theme } from "@sigil/core";

export interface PackCard {
  uid: string;
  card: CardId;
  params: Record<string, string>;
}

export type ExportFormat = "markdown-picture" | "markdown" | "html" | "url";

export interface PresetParams {
  theme: string;
  overrides: Partial<Theme["colors"]>;
  cards: Pick<PackCard, "card" | "params">[];
}

export interface StudioState {
  user: string;
  theme: string;
  overrides: Partial<Theme["colors"]>;
  cards: PackCard[];
  selectedUid: string | null;
  exportFormat: ExportFormat;
  setUser(u: string): void;
  setTheme(id: string): void;
  setOverride(k: keyof Theme["colors"], hex: string | null): void;
  addCard(c: CardId): void;
  removeCard(uid: string): void;
  moveCard(from: number, to: number): void;
  updateParams(uid: string, p: Record<string, string>): void;
  loadPreset(p: PresetParams): void;
}

export interface CardPreviewProps {
  card: PackCard;
  snapshot: GithubSnapshot;
  theme: Theme;
}

export interface ThemeCardProps {
  theme: Theme;
  votes: number;
  voted: boolean;
  onVote(id: string): void;
  onApply(id: string): void;
}

export interface CopyBlockProps {
  label: string;
  value: string;
}
