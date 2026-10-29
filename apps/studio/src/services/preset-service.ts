import type { PresetParams } from "../types.js";

export interface PresetItem {
  id: string;
  name: string;
  preset: PresetParams;
  createdAt: string;
}

const STORAGE_KEY = "sigil_user_presets";

const DEFAULT_PRESETS: PresetItem[] = [
  {
    id: "preset-obsidian-classic",
    name: "Obsidian Classic",
    createdAt: "2026-09-01T00:00:00Z",
    preset: {
      theme: "obsidian",
      overrides: {},
      cards: [
        { card: "overview", params: {} },
        { card: "streak", params: {} },
        { card: "languages", params: {} },
        { card: "heatmap", params: {} },
      ],
    },
  },
  {
    id: "preset-minimal-code",
    name: "Minimalist Code",
    createdAt: "2026-09-10T00:00:00Z",
    preset: {
      theme: "monolith",
      overrides: {},
      cards: [
        { card: "activity", params: { weeks: "8" } },
        { card: "repo", params: {} },
        { card: "languages", params: { layout: "compact" } },
      ],
    },
  },
  {
    id: "preset-full-banner",
    name: "Full Profile Showcase",
    createdAt: "2026-09-15T00:00:00Z",
    preset: {
      theme: "verdigris",
      overrides: {},
      cards: [
        { card: "banner", params: {} },
        { card: "overview", params: {} },
        { card: "achievements", params: {} },
        { card: "skyline", params: {} },
      ],
    },
  },
];

export async function listPresets(): Promise<PresetItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRESETS;
    const items = JSON.parse(raw);
    return [...DEFAULT_PRESETS, ...items];
  } catch {
    return DEFAULT_PRESETS;
  }
}

export async function savePreset(name: string, preset: PresetParams): Promise<PresetItem> {
  const item: PresetItem = {
    id: `preset-${Date.now()}`,
    name,
    preset,
    createdAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: PresetItem[] = raw ? JSON.parse(raw) : [];
    existing.unshift(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn("Failed to persist preset to localStorage", err);
  }

  return item;
}

export async function deletePreset(id: string): Promise<void> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const existing: PresetItem[] = JSON.parse(raw);
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to delete preset from localStorage", err);
  }
}
