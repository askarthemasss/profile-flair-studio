import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useThemes } from "../../hooks/useThemes.js";
import { useStudioStore } from "../../store/studio-store.js";
import { ThemeCard } from "./ThemeCard.js";
import { Reveal } from "../ui/Reveal.js";
import { Search } from "lucide-react";

type ModeFilter = "all" | "dark" | "light";

export const ThemeGrid: React.FC = () => {
  const { themes } = useThemes();
  const { setTheme } = useStudioStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const modeParam = searchParams.get("mode");
  const filter: ModeFilter = modeParam === "dark" || modeParam === "light" ? modeParam : "all";

  const updateParams = (updates: { q?: string; mode?: ModeFilter }) => {
    const next = new URLSearchParams(searchParams);
    const nextQuery = updates.q ?? query;
    const nextMode = updates.mode ?? filter;

    if (nextQuery) next.set("q", nextQuery);
    else next.delete("q");

    if (nextMode !== "all") next.set("mode", nextMode);
    else next.delete("mode");

    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => setSearchParams({}, { replace: true });

  const filtered = themes.filter((theme) => {
    if (filter !== "all" && theme.mode !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return theme.name.toLowerCase().includes(q) || theme.author.toLowerCase().includes(q);
    }
    return true;
  });

  const handleApply = (id: string) => {
    setTheme(id);
    navigate("/studio");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-grey"
            aria-hidden="true"
          />
          <input
            type="search"
            name="theme-search"
            placeholder="Search themes or authors…"
            value={query}
            onChange={(e) => updateParams({ q: e.target.value })}
            aria-label="Search themes"
            autoComplete="off"
            spellCheck={false}
            className="notebook-field pl-9 text-xs"
          />
        </div>

        <div className="segmented self-start sm:self-auto">
          {(["all", "dark", "light"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => updateParams({ mode: m })}
              data-active={filter === m}
              aria-pressed={filter === m}
              aria-label={m === "all" ? "Show all themes" : `Show ${m} themes`}
              className="segmented__btn capitalize"
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <h2 className="sr-only">Theme results</h2>

      <p className="-mt-3 text-xs text-warm-grey" role="status" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "theme" : "themes"}
        {query ? ` matching “${query}”` : ""}
        {filter !== "all" ? ` in ${filter} mode` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="notebook-card p-10 text-center">
          <p className="font-display text-xl font-light tracking-[0.03em] text-charcoal">
            No themes match{query ? ` “${query}”` : " this filter"}
          </p>
          <p className="mt-1 text-xs text-warm-grey">
            Try another search, or clear the mode filter.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="notebook-btn notebook-btn--secondary notebook-btn--sm mt-4"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((theme, index) => (
            <Reveal key={theme.id} delay={Math.min(index, 6) * 60}>
              <ThemeCard theme={theme} onApply={handleApply} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
};
