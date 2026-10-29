import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CardId, Theme } from "@sigil/core";
import type { ExportFormat, PackCard, PresetParams, StudioState } from "../types.js";

function makeUid(card: CardId): string {
  return `${card}-${Math.random().toString(36).slice(2, 8)}`;
}

const DEFAULT_CARDS: PackCard[] = [
  { uid: "card-overview-default", card: "overview", params: {} },
  { uid: "card-streak-default", card: "streak", params: {} },
  { uid: "card-languages-default", card: "languages", params: {} },
  { uid: "card-heatmap-default", card: "heatmap", params: {} },
];

interface ExtendedStudioState extends StudioState {
  setSelectedUid(uid: string | null): void;
  setExportFormat(format: ExportFormat): void;
  reset(): void;
}

export const useStudioStore = create<ExtendedStudioState>()(
  persist(
    (set) => ({
      user: "veera-siddhan",
      theme: "obsidian",
      overrides: {},
      cards: DEFAULT_CARDS,
      selectedUid: DEFAULT_CARDS[0]!.uid,
      exportFormat: "markdown-picture",

      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setOverride: (k, hex) =>
        set((s) => {
          const next = { ...s.overrides };
          if (hex === null) {
            delete next[k];
          } else {
            next[k] = hex;
          }
          return { overrides: next };
        }),

      addCard: (card) =>
        set((s) => {
          const newCard: PackCard = {
            uid: makeUid(card),
            card,
            params: {},
          };
          return {
            cards: [...s.cards, newCard],
            selectedUid: newCard.uid,
          };
        }),

      removeCard: (uid) =>
        set((s) => {
          const nextCards = s.cards.filter((c) => c.uid !== uid);
          const nextSelected = s.selectedUid === uid ? (nextCards[0]?.uid ?? null) : s.selectedUid;
          return {
            cards: nextCards,
            selectedUid: nextSelected,
          };
        }),

      moveCard: (from, to) =>
        set((s) => {
          if (from < 0 || from >= s.cards.length || to < 0 || to >= s.cards.length) return s;
          const nextCards = [...s.cards];
          const [moved] = nextCards.splice(from, 1);
          if (moved) {
            nextCards.splice(to, 0, moved);
          }
          return { cards: nextCards };
        }),

      updateParams: (uid, p) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.uid === uid ? { ...c, params: { ...c.params, ...p } } : c)),
        })),

      loadPreset: (preset) =>
        set({
          theme: preset.theme,
          overrides: preset.overrides,
          cards: preset.cards.map((c) => ({
            uid: makeUid(c.card),
            card: c.card,
            params: c.params,
          })),
        }),

      setSelectedUid: (selectedUid) => set({ selectedUid }),
      setExportFormat: (exportFormat) => set({ exportFormat }),
      reset: () =>
        set({
          user: "veera-siddhan",
          theme: "obsidian",
          overrides: {},
          cards: DEFAULT_CARDS,
          selectedUid: DEFAULT_CARDS[0]!.uid,
          exportFormat: "markdown-picture",
        }),
    }),
    {
      name: "sigil-studio-state",
    },
  ),
);
