import { create } from "zustand";

export type UiTheme = "light" | "dark";

const STORAGE_KEY = "color-scheme";
const LIGHT_THEME_COLOR = "#F7F5F0";
const DARK_THEME_COLOR = "#141210";

function readTheme(): UiTheme {
  if (typeof document === "undefined") return "light";

  const attribute = document.documentElement.getAttribute("data-theme");
  if (attribute === "dark" || attribute === "light") return attribute;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Storage can be unavailable in private browsing; fall through to system.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: UiTheme) {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-theme", theme);

  const scheme = document.querySelector('meta[name="color-scheme"]');
  if (scheme) scheme.setAttribute("content", theme);

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute("content", theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }
}

interface UiThemeState {
  theme: UiTheme;
  setTheme(theme: UiTheme): void;
  toggleTheme(): void;
}

const initialTheme = readTheme();
applyTheme(initialTheme);

export const useUiThemeStore = create<UiThemeState>((set, get) => ({
  theme: initialTheme,
  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Persisting is best-effort; the attribute still updates for this tab.
    }
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme() {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue !== "light" && event.newValue !== "dark") return;

    applyTheme(event.newValue);
    useUiThemeStore.setState({ theme: event.newValue });
  });
}
