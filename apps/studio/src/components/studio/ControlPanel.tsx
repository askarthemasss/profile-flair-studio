import React from "react";
import { BUILTIN_THEMES, type Theme } from "@sigil/core";
import { useStudioStore } from "../../store/studio-store.js";
import { User, Palette, Sliders, RotateCcw } from "lucide-react";

export const ControlPanel: React.FC = () => {
  const {
    user,
    theme,
    overrides,
    cards,
    selectedUid,
    setUser,
    setTheme,
    setOverride,
    updateParams,
    reset,
  } = useStudioStore();

  const selectedCard = cards.find((c) => c.uid === selectedUid);
  const themeList = Object.values(BUILTIN_THEMES) as Theme[];

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-line bg-panel p-4 shadow-card">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">
          Pack Settings
        </h2>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-ember transition-colors"
          title="Reset to default pack"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* GitHub Username */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          <User className="h-3.5 w-3.5" />
          <span>GitHub Username</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value.trim())}
            placeholder="e.g. torvalds"
            className="w-full rounded border border-line bg-raised px-3 py-1.5 font-mono text-xs text-ink transition-colors placeholder:text-ink-faint focus:border-ember focus:outline-none"
          />
        </div>
      </div>

      {/* Theme selection */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          <Palette className="h-3.5 w-3.5" />
          <span>Card Theme</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {themeList.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-ember bg-raised text-ember font-semibold"
                    : "border-line bg-obsidian/60 text-ink-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                <span>{t.name}</span>
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/30"
                  style={{ backgroundColor: t.colors.accent }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Overrides */}
      <div className="flex flex-col gap-2 border-t border-line pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Color Overrides
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-ink-faint">Accent</span>
            <input
              type="text"
              placeholder="#ff6a2b"
              value={overrides.accent ?? ""}
              onChange={(e) => setOverride("accent", e.target.value || null)}
              className="mt-1 w-full rounded border border-line bg-raised px-2 py-1 font-mono text-[11px] text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-ink-faint">Background</span>
            <input
              type="text"
              placeholder="#0b0a0c"
              value={overrides.bg ?? ""}
              onChange={(e) => setOverride("bg", e.target.value || null)}
              className="mt-1 w-full rounded border border-line bg-raised px-2 py-1 font-mono text-[11px] text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Selected Card Parameter Inspector */}
      {selectedCard && (
        <div className="flex flex-col gap-2.5 border-t border-line pt-3">
          <div className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-ember" />
            <span className="text-xs font-semibold text-ink">
              {selectedCard.card.toUpperCase()} Card Options
            </span>
          </div>

          {selectedCard.card === "overview" && (
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Show Rank Badge</span>
              <select
                value={selectedCard.params.show_rank ?? "1"}
                onChange={(e) => updateParams(selectedCard.uid, { show_rank: e.target.value })}
                className="rounded border border-line bg-raised px-2 py-1 text-xs text-ink"
              >
                <option value="1">Enabled</option>
                <option value="0">Disabled</option>
              </select>
            </div>
          )}

          {selectedCard.card === "streak" && (
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Hide Longest Streak</span>
              <select
                value={selectedCard.params.hide_longest_streak ?? "0"}
                onChange={(e) =>
                  updateParams(selectedCard.uid, { hide_longest_streak: e.target.value })
                }
                className="rounded border border-line bg-raised px-2 py-1 text-xs text-ink"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          )}

          {selectedCard.card === "languages" && (
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Max Languages</span>
              <input
                type="number"
                min={1}
                max={15}
                value={selectedCard.params.langs_count ?? "8"}
                onChange={(e) =>
                  updateParams(selectedCard.uid, { langs_count: e.target.value })
                }
                className="w-16 rounded border border-line bg-raised px-2 py-1 font-mono text-xs text-ink"
              >
              </input>
            </div>
          )}

          {selectedCard.card === "heatmap" && (
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Weeks to Show</span>
              <select
                value={selectedCard.params.weeks ?? "26"}
                onChange={(e) => updateParams(selectedCard.uid, { weeks: e.target.value })}
                className="rounded border border-line bg-raised px-2 py-1 text-xs text-ink"
              >
                <option value="12">12 Weeks</option>
                <option value="26">26 Weeks</option>
                <option value="52">52 Weeks (Full Year)</option>
              </select>
            </div>
          )}

          {selectedCard.card === "activity" && (
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Show Point Dots</span>
              <select
                value={selectedCard.params.show_dots ?? "0"}
                onChange={(e) => updateParams(selectedCard.uid, { show_dots: e.target.value })}
                className="rounded border border-line bg-raised px-2 py-1 text-xs text-ink"
              >
                <option value="0">Lines only</option>
                <option value="1">Show Dots</option>
              </select>
            </div>
          )}

          {selectedCard.card === "achievements" && (
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Show Unearned Badges</span>
              <select
                value={selectedCard.params.show_unearned ?? "1"}
                onChange={(e) =>
                  updateParams(selectedCard.uid, { show_unearned: e.target.value })
                }
                className="rounded border border-line bg-raised px-2 py-1 text-xs text-ink"
              >
                <option value="1">Show Locked</option>
                <option value="0">Unlocked Only</option>
              </select>
            </div>
          )}

          {selectedCard.card === "repo" && (
            <div className="flex flex-col gap-1 text-xs text-ink-muted">
              <span>Specific Repo Name</span>
              <input
                type="text"
                placeholder="e.g. sigil"
                value={selectedCard.params.repo ?? ""}
                onChange={(e) => updateParams(selectedCard.uid, { repo: e.target.value })}
                className="rounded border border-line bg-raised px-2 py-1 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
              />
            </div>
          )}

          {selectedCard.card === "banner" && (
            <div className="flex flex-col gap-1 text-xs text-ink-muted">
              <span>Custom Tagline</span>
              <input
                type="text"
                placeholder="Full-stack engineer & open-source builder"
                value={selectedCard.params.tagline ?? ""}
                onChange={(e) => updateParams(selectedCard.uid, { tagline: e.target.value })}
                className="rounded border border-line bg-raised px-2 py-1 text-xs text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
