import {
  CARD_KIND_IDS,
  normalizeUsername,
  resolveCardKind,
  type CardKind,
} from "@sigil/core/profile";
import { BUILTIN_THEMES, DEFAULT_THEME_ID } from "@sigil/core/themes";

import type { StudioState } from "./studio-data";

/** Shape stored in `card_presets.params`. Extra keys survive a round trip. */
export interface PackCard {
  card: CardKind;
  params?: Record<string, unknown>;
}

export interface PackParams {
  theme: string;
  overrides: Record<string, unknown>;
  cards: PackCard[];
  animate: boolean;
  staticBackup: boolean;
  username: string;
}

export interface PackDraft {
  name: string;
  isPublic: boolean;
  packId: string | null;
  params: PackParams;
}

const DRAFT_KEY = "sigil:pack-draft";
const NAME_MAX = 60;

export function normalizePackName(name: string): string | null {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length < 1 || trimmed.length > NAME_MAX) return null;
  return trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function themeId(value: unknown): string {
  return typeof value === "string" && BUILTIN_THEMES.some((theme) => theme.id === value)
    ? value
    : DEFAULT_THEME_ID;
}

/** Accepts the stored jsonb, including the signup default that omits animation fields. */
export function parsePackParams(raw: unknown): PackParams | null {
  if (!isRecord(raw)) return null;

  const seen = new Set<CardKind>();
  const cards: PackCard[] = [];
  const cardsRaw = Array.isArray(raw["cards"]) ? raw["cards"] : [];
  for (const item of cardsRaw) {
    let id = "";
    let params: Record<string, unknown> | undefined;
    if (typeof item === "string") {
      id = item;
    } else if (isRecord(item) && typeof item["card"] === "string") {
      id = item["card"];
      if (isRecord(item["params"])) params = item["params"];
    } else {
      continue;
    }
    const kind = resolveCardKind(id);
    if (!kind || seen.has(kind)) continue;
    seen.add(kind);
    cards.push(params ? { card: kind, params } : { card: kind });
  }

  const usernameRaw = typeof raw["username"] === "string" ? raw["username"] : "";

  return {
    theme: themeId(raw["theme"]),
    overrides: isRecord(raw["overrides"]) ? raw["overrides"] : {},
    cards,
    animate: typeof raw["animate"] === "boolean" ? raw["animate"] : true,
    staticBackup: typeof raw["staticBackup"] === "boolean" ? raw["staticBackup"] : true,
    username: normalizeUsername(usernameRaw) ?? "",
  };
}

/** Enabled cards in catalog order. Prior per-card params and overrides are kept. */
export function packParamsFromState(state: StudioState, previous: PackParams | null): PackParams {
  const previousByCard = new Map(previous?.cards.map((card) => [card.card, card] as const) ?? []);
  const cards: PackCard[] = [];
  for (const kind of CARD_KIND_IDS) {
    if (!state.enabled[kind]) continue;
    const prior = previousByCard.get(kind);
    cards.push(prior?.params ? { card: kind, params: prior.params } : { card: kind });
  }
  return {
    theme: themeId(state.themeId),
    overrides: previous?.overrides ?? {},
    cards,
    animate: state.animate,
    staticBackup: state.staticBackup,
    username: normalizeUsername(state.username) ?? "",
  };
}

export function applyPackToState(current: StudioState, params: PackParams): StudioState {
  const enabled = { ...current.enabled };
  for (const kind of CARD_KIND_IDS) enabled[kind] = false;
  for (const card of params.cards) enabled[card.card] = true;
  return {
    ...current,
    themeId: params.theme,
    enabled,
    animate: params.animate,
    staticBackup: params.staticBackup,
    ...(params.username ? { username: params.username } : {}),
  };
}

export function stashPackDraft(draft: PackDraft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* private mode */
  }
}

export function takePackDraft(): PackDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const params = parsePackParams(parsed["params"]);
    const name = typeof parsed["name"] === "string" ? normalizePackName(parsed["name"]) : null;
    if (!params || !name) return null;
    return {
      name,
      isPublic: parsed["isPublic"] === true,
      packId: typeof parsed["packId"] === "string" ? parsed["packId"] : null,
      params,
    };
  } catch {
    return null;
  }
}

/**
 * Read the sign-in draft once per page load.
 * React strict mode runs effects twice; the second call returns the same draft.
 */
let claimed: PackDraft | null | undefined;

export function claimPackDraft(): PackDraft | null {
  if (claimed !== undefined) return claimed;
  claimed = takePackDraft();
  queueMicrotask(() => {
    claimed = undefined;
  });
  return claimed;
}
