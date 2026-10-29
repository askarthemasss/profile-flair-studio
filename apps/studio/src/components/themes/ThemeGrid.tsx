import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemes } from "../../hooks/useThemes.js";
import { useStudioStore } from "../../store/studio-store.js";
import { ThemeCard } from "./ThemeCard.js";
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
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" />
          <input
            type="text"
            placeholder="Search themes or authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-line bg-raised pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-md border border-line bg-panel p-1 text-xs">
          {(["all", "dark", "light"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`rounded px-3 py-1 font-medium capitalize transition-all ${
                filter === m ? "bg-raised text-ember shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <ThemeCard
            key={item.theme.id}
            theme={item.theme}
            votes={item.votes}
            voted={item.voted}
            onVote={voteTheme}
            onApply={handleApply}
          />
        ))}
      </div>
    </div>
  );
};
