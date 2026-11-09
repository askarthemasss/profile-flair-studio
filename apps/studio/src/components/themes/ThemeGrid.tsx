import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemes } from "../../hooks/useThemes.js";
import { useStudioStore } from "../../store/studio-store.js";
import { ThemeCard } from "./ThemeCard.js";
import { Reveal } from "../ui/Reveal.js";
import { Search } from "lucide-react";

export const ThemeGrid: React.FC = () => {
  const { themes, voteTheme } = useThemes();
  const { setTheme } = useStudioStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "dark" | "light">("all");
  const [query, setQuery] = useState("");

  const filtered = themes.filter((t) => {
    if (filter !== "all" && t.theme.mode !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return t.theme.name.toLowerCase().includes(q) || t.theme.author.toLowerCase().includes(q);
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
            type="text"
            placeholder="Search themes or authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search themes"
            className="notebook-field pl-9 text-xs"
          />
        </div>

        <div className="segmented self-start sm:self-auto">
          {(["all", "dark", "light"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilter(m)}
              data-active={filter === m}
              className="segmented__btn capitalize"
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="notebook-card p-10 text-center">
          <p className="font-display text-xl font-light tracking-[0.03em] text-charcoal">
            Nothing on this page yet
          </p>
          <p className="mt-1 text-xs text-warm-grey">
            Try a different search, or clear the mode filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, index) => (
            <Reveal key={item.theme.id} delay={Math.min(index, 6) * 60}>
              <ThemeCard
                theme={item.theme}
                votes={item.votes}
                voted={item.voted}
                onVote={voteTheme}
                onApply={handleApply}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
};
