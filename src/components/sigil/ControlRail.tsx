import { BRAND } from "@sigil/core/brand";
import type { CardTheme } from "@sigil/core/themes";
import { CARD_KINDS, type CardKind, type StudioState } from "@/lib/studio-data";

import { ThemeGallery } from "./ThemeGallery";

interface Props {
  state: StudioState;
  onChange: (next: StudioState) => void;
  themes: CardTheme[];
  usernameNote?: string;
  usernameWarn?: boolean;
}

export function ControlRail({ state, onChange, themes, usernameNote, usernameWarn }: Props) {
  const mono = { fontFamily: "var(--font-mono)" } as const;

  function toggle(kind: CardKind) {
    onChange({
      ...state,
      enabled: { ...state.enabled, [kind]: !state.enabled[kind] },
    });
  }

  function setField<K extends keyof StudioState>(key: K, value: StudioState[K]) {
    onChange({ ...state, [key]: value });
  }

  const enabledCount = CARD_KINDS.filter((c) => state.enabled[c.id]).length;

  return (
    <aside className="flex flex-col gap-5">
      <section className="rounded-lg border border-line bg-panel p-5 shadow-card">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
          Forging
        </h2>

        <label htmlFor="studio-username" className="mt-4 block text-[11px] text-ink-muted">
          GitHub username
        </label>
        <div className="sg-ledger mt-1 flex items-center gap-2 px-1 py-2">
          <span className="text-ink-faint" style={mono}>@</span>
          <input
            id="studio-username"
            value={state.username}
            onChange={(e) => setField("username", e.target.value)}
            placeholder="username"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            style={mono}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        {usernameNote ? (
          <p
            className={`mt-2 text-[10px] ${usernameWarn ? "text-ember" : "text-ink-faint"}`}
            style={mono}
          >
            {usernameNote}
          </p>
        ) : null}

        <p id="studio-theme" className="mt-4 text-[11px] text-ink-muted">
          Theme
        </p>
        <div className="mt-1" role="group" aria-labelledby="studio-theme">
          <ThemeGallery
            themes={themes}
            selected={state.themeId}
            onSelect={(id) => setField("themeId", id)}
          />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>Cards</h2>
          <span className="text-[10px] text-ember" style={mono}>{enabledCount}/9</span>
        </div>
        <div className="mt-3 space-y-1">
          {CARD_KINDS.map((c) => {
            const on = state.enabled[c.id];
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(c.id)}
                className="sg-focus flex min-h-10 w-full items-center justify-between rounded-md px-2 text-left text-[13px] transition-colors hover:bg-hover-surface"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="size-2 shrink-0 rounded-full transition-colors"
                    style={{
                      background: on ? "var(--sg-ember)" : "transparent",
                      outline: on ? "none" : "1px solid var(--sg-border-strong)",
                    }}
                  />
                  <span
                    className={on ? "truncate text-ink" : "truncate text-ink-faint line-through"}
                  >
                    {c.name}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] text-ink-faint" style={mono}>
                  {c.id}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel p-5 shadow-card">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>Options</h2>
        <div className="mt-3 space-y-3">
          <ToggleRow
            label="Living animation"
            hint="breathing glow + count-up"
            on={state.animate}
            onToggle={() => setField("animate", !state.animate)}
          />
          <ToggleRow
            label="Static SVG backup"
            hint="GitHub Action commits copies"
            on={state.staticBackup}
            onToggle={() => setField("staticBackup", !state.staticBackup)}
          />
        </div>
        <div className="mt-4">
          <div className="text-[11px] text-ink-muted">Preview</div>
          <div className="mt-1 grid grid-cols-2 gap-1 rounded-md border border-line bg-raised p-1">
            {(
              [
                ["studio", "Designed"],
                ["svg", "Live SVG"],
              ] as const
            ).map(([mode, label]) => {
              const on = state.preview === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setField("preview", mode)}
                  className="sg-focus rounded px-2 py-1.5 text-[12px] transition-colors"
                  style={{
                    background: on ? "var(--sg-ember)" : "transparent",
                    color: on ? "var(--sg-bg-0)" : "var(--sg-ink-muted)",
                    ...mono,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-4 text-[10px] leading-relaxed text-ink-faint" style={mono}>
          {BRAND.shortTagline} Sign in with Google to save packs and use your own API quota.
        </p>
      </section>
    </aside>
  );
}

function ToggleRow({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className="sg-focus flex min-h-10 w-full items-center justify-between rounded-md text-left"
    >
      <span>
        <span className="block text-[13px] text-ink">{label}</span>
        <span className="text-[10px] text-ink-faint">{hint}</span>
      </span>
      <span
        className="relative h-5 w-9 rounded-full transition-colors"
        style={{ background: on ? "var(--sg-ember)" : "var(--sg-bg-3)" }}
      >
        <span
          className="absolute top-0.5 size-4 rounded-full bg-obsidian transition-all"
          style={{ left: on ? "calc(100% - 18px)" : "2px" }}
        />
      </span>
    </button>
  );
}
