import React from "react";
import { Moon, Sun } from "lucide-react";
import { useUiThemeStore } from "../../store/ui-theme-store.js";

export const ThemeToggle: React.FC = () => {
  const theme = useUiThemeStore((state) => state.theme);
  const toggleTheme = useUiThemeStore((state) => state.toggleTheme);
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} theme`}
    >
      <span className="theme-toggle__disc" aria-hidden="true">
        <Sun className="theme-toggle__icon theme-toggle__icon--light" />
        <Moon className="theme-toggle__icon theme-toggle__icon--dark" />
      </span>
      <span className="theme-toggle__text">{theme === "dark" ? "day mode" : "night mode"}</span>
    </button>
  );
};
