import React, { useEffect, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { BUILTIN_THEMES, type Theme } from "@sigil/core";
import { useStudioStore } from "../../store/studio-store.js";
import { useProfileLoader } from "../../hooks/useProfileLoader.js";
import { User, Palette, Sliders, RotateCcw, Search, Loader2 } from "lucide-react";

export const ControlPanel: React.FC = () => {
  const { user, theme, overrides, cards, selectedUid, setTheme, setOverride, updateParams, reset } =
    useStudioStore();

  const selectedCard = cards.find((c) => c.uid === selectedUid);
  const themeList = Object.values(BUILTIN_THEMES) as Theme[];

  const [draftUser, setDraftUser] = useState(user);
  const loadProfile = useProfileLoader();
  const isFetching = useIsFetching({ queryKey: ["snapshot"] }) > 0;
  // A different handle must be able to supersede an in-flight lookup; the
  // loader and useSnapshot cancel the old request when the store moves.
  const canLoad = draftUser.trim().length > 0;

  // Keep the draft in sync when the store changes from outside this input
  // (Reset, preset load, or a restored persisted handle).
  useEffect(() => {
    setDraftUser(user);
  }, [user]);

  const handleLoad = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canLoad) return;

    const handle = draftUser.trim();
    setDraftUser(handle);
    loadProfile(handle);
  };

  const handleReset = () => {
    reset();
    // Reset also restores the default handle; if it was already the store
    // value, the sync effect above would not fire, so update the draft here.
    setDraftUser(useStudioStore.getState().user);
  };

  return (
    <div className="notebook-card flex flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
        <div>
          <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal">
            Pack Settings
          </h2>
          <p className="mt-0.5 font-display text-xs italic text-warm-grey">
            A place for the particulars.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="notebook-btn notebook-btn--ghost notebook-btn--sm shrink-0"
          title="Reset to default pack"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* GitHub Username */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="github-username" className="notebook-label">
          <User className="h-3.5 w-3.5" />
          <span>GitHub Username</span>
        </label>
        <form onSubmit={handleLoad} className="flex items-stretch gap-1.5">
          <input
            id="github-username"
            type="text"
            value={draftUser}
            onChange={(e) => setDraftUser(e.target.value)}
            placeholder="e.g. torvalds"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={39}
            className="notebook-field min-w-0 flex-1 font-mono text-xs"
          />
          <button
            type="submit"
            disabled={!canLoad}
            aria-busy={isFetching}
            title={isFetching ? "Fetching GitHub data..." : "Fetch this profile"}
            className="notebook-btn notebook-btn--primary notebook-btn--sm shrink-0"
          >
            {isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>Load</span>
          </button>
        </form>
        <p className="text-[10px] leading-relaxed text-warm-grey">
          Fetches when you press Load; typing never spends GitHub API calls.
        </p>
      </div>

      {/* Theme selection */}
      <div className="flex flex-col gap-1.5">
        <span className="notebook-label">
          <Palette className="h-3.5 w-3.5" />
          <span>Card Theme</span>
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {themeList.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center justify-between gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "border-terracotta bg-blush text-charcoal"
                    : "border-line bg-transparent text-warm-grey hover:border-line-strong hover:text-charcoal"
                }`}
              >
                <span>{t.name}</span>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/20"
                  style={{ backgroundColor: t.colors.accent }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Overrides */}
      <div className="flex flex-col gap-2 border-t border-line pt-3">
        <span className="notebook-label">Color Overrides</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-warm-grey">Accent</span>
            <input
              type="text"
              placeholder="#B87A5A"
              value={overrides.accent ?? ""}
              onChange={(e) => setOverride("accent", e.target.value || null)}
              className="notebook-field mt-1 px-2 py-1 font-mono text-[11px]"
            />
          </div>
          <div>
            <span className="text-[10px] text-warm-grey">Background</span>
            <input
              type="text"
              placeholder="#141210"
              value={overrides.bg ?? ""}
              onChange={(e) => setOverride("bg", e.target.value || null)}
              className="notebook-field mt-1 px-2 py-1 font-mono text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* Selected Card Parameter Inspector */}
      {selectedCard ? (
        <div className="flex flex-col gap-2.5 border-t border-line pt-3">
          <div className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-terracotta" />
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal">
              {selectedCard.card.toUpperCase()} Card Options
            </span>
          </div>

          {selectedCard.card === "overview" ? (
            <div className="flex items-center justify-between text-xs text-warm-grey">
              <span>Show Rank Badge</span>
              <select
                value={selectedCard.params.show_rank ?? "1"}
                onChange={(e) => updateParams(selectedCard.uid, { show_rank: e.target.value })}
                className="notebook-field w-auto px-2 py-1 text-xs"
              >
                <option value="1">Enabled</option>
                <option value="0">Disabled</option>
              </select>
            </div>
          ) : null}

          {selectedCard.card === "streak" ? (
            <div className="flex items-center justify-between text-xs text-warm-grey">
              <span>Hide Longest Streak</span>
              <select
                value={selectedCard.params.hide_longest_streak ?? "0"}
                onChange={(e) =>
                  updateParams(selectedCard.uid, { hide_longest_streak: e.target.value })
                }
                className="notebook-field w-auto px-2 py-1 text-xs"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          ) : null}

          {selectedCard.card === "languages" ? (
            <div className="flex items-center justify-between text-xs text-warm-grey">
              <span>Max Languages</span>
              <input
                type="number"
                min={1}
                max={15}
                value={selectedCard.params.langs_count ?? "8"}
                onChange={(e) => updateParams(selectedCard.uid, { langs_count: e.target.value })}
                className="notebook-field w-16 px-2 py-1 font-mono text-xs"
              />
            </div>
          ) : null}

          {selectedCard.card === "heatmap" ? (
            <div className="flex items-center justify-between text-xs text-warm-grey">
              <span>Weeks to Show</span>
              <select
                value={selectedCard.params.weeks ?? "26"}
                onChange={(e) => updateParams(selectedCard.uid, { weeks: e.target.value })}
                className="notebook-field w-auto px-2 py-1 text-xs"
              >
                <option value="12">12 Weeks</option>
                <option value="26">26 Weeks</option>
                <option value="52">52 Weeks (Full Year)</option>
              </select>
            </div>
          ) : null}

          {selectedCard.card === "activity" ? (
            <div className="flex items-center justify-between text-xs text-warm-grey">
              <span>Show Point Dots</span>
              <select
                value={selectedCard.params.show_dots ?? "0"}
                onChange={(e) => updateParams(selectedCard.uid, { show_dots: e.target.value })}
                className="notebook-field w-auto px-2 py-1 text-xs"
              >
                <option value="0">Lines only</option>
                <option value="1">Show Dots</option>
              </select>
            </div>
          ) : null}

          {selectedCard.card === "achievements" ? (
            <div className="flex items-center justify-between text-xs text-warm-grey">
              <span>Show Unearned Badges</span>
              <select
                value={selectedCard.params.show_unearned ?? "1"}
                onChange={(e) => updateParams(selectedCard.uid, { show_unearned: e.target.value })}
                className="notebook-field w-auto px-2 py-1 text-xs"
              >
                <option value="1">Show Locked</option>
                <option value="0">Unlocked Only</option>
              </select>
            </div>
          ) : null}

          {selectedCard.card === "repo" ? (
            <div className="flex flex-col gap-1 text-xs text-warm-grey">
              <span>Specific Repo Name</span>
              <input
                type="text"
                placeholder="e.g. sigil"
                value={selectedCard.params.repo ?? ""}
                onChange={(e) => updateParams(selectedCard.uid, { repo: e.target.value })}
                className="notebook-field px-2 py-1 font-mono text-xs"
              />
            </div>
          ) : null}

          {selectedCard.card === "banner" ? (
            <div className="flex flex-col gap-1 text-xs text-warm-grey">
              <span>Custom Tagline</span>
              <input
                type="text"
                placeholder="Full-stack engineer & open-source builder"
                value={selectedCard.params.tagline ?? ""}
                onChange={(e) => updateParams(selectedCard.uid, { tagline: e.target.value })}
                className="notebook-field px-2 py-1 text-xs"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
