import React, { useEffect, useRef, useState } from "react";
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
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetToggleRef = useRef<HTMLButtonElement>(null);
  const resetConfirmRef = useRef<HTMLButtonElement>(null);
  const loadProfile = useProfileLoader();
  const isFetching = useIsFetching({ queryKey: ["snapshot"] }) > 0;
  // A different handle must be able to supersede an in-flight lookup; the
  // loader and useSnapshot cancel the old request when the store moves.
  const canLoad = draftUser.trim().length > 0;

  // Keep the draft in sync when the store changes from outside this input
  // (Reset or a restored persisted handle).
  useEffect(() => {
    setDraftUser(user);
  }, [user]);

  useEffect(() => {
    if (confirmingReset) resetConfirmRef.current?.focus();
  }, [confirmingReset]);

  const handleLoad = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canLoad) return;

    const handle = draftUser.trim();
    setDraftUser(handle);
    loadProfile(handle);
  };

  const closeReset = () => {
    setConfirmingReset(false);
    resetToggleRef.current?.focus();
  };

  const handleReset = () => {
    reset();
    // Reset also restores the default handle; if it was already the store
    // value, the sync effect above would not fire, so update the draft here.
    setDraftUser(useStudioStore.getState().user);
    closeReset();
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
          ref={resetToggleRef}
          type="button"
          onClick={() => setConfirmingReset((open) => !open)}
          className="notebook-btn notebook-btn--ghost notebook-btn--sm shrink-0"
          title="Reset to default pack"
          aria-expanded={confirmingReset}
          aria-controls="reset-confirmation"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          <span>Reset</span>
        </button>
      </div>

      {confirmingReset ? (
        <div
          id="reset-confirmation"
          role="alert"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeReset();
          }}
          className="rounded-md border border-crimson/30 bg-crimson/5 p-3"
        >
          <p className="text-[11px] leading-relaxed text-soft-black">
            Reset the pack to defaults? This clears your cards, theme, and color overrides.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              ref={resetConfirmRef}
              type="button"
              onClick={handleReset}
              className="notebook-btn notebook-btn--danger notebook-btn--sm"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Reset Pack</span>
            </button>
            <button
              type="button"
              onClick={closeReset}
              className="notebook-btn notebook-btn--ghost notebook-btn--sm"
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* GitHub Username */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="github-username" className="notebook-label">
          <User className="h-3.5 w-3.5" aria-hidden="true" />
          <span>GitHub Username</span>
        </label>
        <form onSubmit={handleLoad} className="flex items-stretch gap-1.5">
          <input
            id="github-username"
            name="github-username"
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
            title={isFetching ? "Fetching GitHub data…" : "Fetch this profile"}
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
        <span id="card-theme-label" className="notebook-label">
          <Palette className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Card Theme</span>
        </span>
        <div role="group" aria-labelledby="card-theme-label" className="grid grid-cols-3 gap-1.5">
          {themeList.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                aria-pressed={active}
                className={`flex items-center justify-between gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "border-terracotta bg-blush text-charcoal"
                    : "border-line bg-transparent text-warm-grey hover:border-line-strong hover:text-charcoal"
                }`}
              >
                <span>{t.name}</span>
                <span
                  aria-hidden="true"
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
            <label htmlFor="override-accent" className="text-[10px] text-warm-grey">
              Accent
            </label>
            <input
              id="override-accent"
              name="accent-override"
              type="text"
              placeholder="#B87A5A"
              autoComplete="off"
              spellCheck={false}
              value={overrides.accent ?? ""}
              onChange={(e) => setOverride("accent", e.target.value || null)}
              className="notebook-field mt-1 px-2 py-1 font-mono text-[11px]"
            />
          </div>
          <div>
            <label htmlFor="override-background" className="text-[10px] text-warm-grey">
              Background
            </label>
            <input
              id="override-background"
              name="background-override"
              type="text"
              placeholder="#141210"
              autoComplete="off"
              spellCheck={false}
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
            <Sliders className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal">
              {selectedCard.card.toUpperCase()} Card Options
            </span>
          </div>

          {selectedCard.card === "overview" ? (
            <div className="flex items-center justify-between gap-2 text-xs text-warm-grey">
              <label htmlFor="param-show-rank">Show Rank Badge</label>
              <select
                id="param-show-rank"
                name="show-rank"
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
            <div className="flex items-center justify-between gap-2 text-xs text-warm-grey">
              <label htmlFor="param-hide-longest-streak">Hide Longest Streak</label>
              <select
                id="param-hide-longest-streak"
                name="hide-longest-streak"
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
            <div className="flex items-center justify-between gap-2 text-xs text-warm-grey">
              <label htmlFor="param-langs-count">Max Languages</label>
              <input
                id="param-langs-count"
                name="langs-count"
                type="number"
                inputMode="numeric"
                min={1}
                max={15}
                value={selectedCard.params.langs_count ?? "8"}
                onChange={(e) => updateParams(selectedCard.uid, { langs_count: e.target.value })}
                className="notebook-field w-16 px-2 py-1 font-mono text-xs"
              />
            </div>
          ) : null}

          {selectedCard.card === "heatmap" ? (
            <div className="flex items-center justify-between gap-2 text-xs text-warm-grey">
              <label htmlFor="param-weeks">Weeks to Show</label>
              <select
                id="param-weeks"
                name="weeks"
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
            <div className="flex items-center justify-between gap-2 text-xs text-warm-grey">
              <label htmlFor="param-show-dots">Show Point Dots</label>
              <select
                id="param-show-dots"
                name="show-dots"
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
            <div className="flex items-center justify-between gap-2 text-xs text-warm-grey">
              <label htmlFor="param-show-unearned">Show Unearned Badges</label>
              <select
                id="param-show-unearned"
                name="show-unearned"
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
              <label htmlFor="param-repo">Specific Repo Name</label>
              <input
                id="param-repo"
                name="repo"
                type="text"
                placeholder="e.g. sigil"
                autoComplete="off"
                spellCheck={false}
                value={selectedCard.params.repo ?? ""}
                onChange={(e) => updateParams(selectedCard.uid, { repo: e.target.value })}
                className="notebook-field px-2 py-1 font-mono text-xs"
              />
            </div>
          ) : null}

          {selectedCard.card === "banner" ? (
            <div className="flex flex-col gap-1 text-xs text-warm-grey">
              <label htmlFor="param-tagline">Custom Tagline</label>
              <input
                id="param-tagline"
                name="tagline"
                type="text"
                placeholder="Full-stack engineer & open-source builder"
                autoComplete="off"
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
