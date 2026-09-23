import { BRAND } from "@sigil/core/brand";
import type { CardTheme } from "@sigil/core/themes";
import { CARD_KINDS, type CardKind, type StudioState } from "@/lib/studio-data";

interface Props {
  state: StudioState;
  onChange: (next: StudioState) => void;
  themes: CardTheme[];
}

export function ControlRail({ state, onChange, themes }: Props) {
  const mono = { fontFamily: "var(--font-mono)" } as const;
  const display = { fontFamily: "var(--font-display)" } as const;

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

        <label className="mt-4 block text-[11px] text-ink-muted">GitHub username</label>
        <div className="sg-ledger mt-1 flex items-center gap-2 px-1 py-2">
          <span className="text-ink-faint" style={mono}>@</span>
          <input
            value={state.username}
            onChange={(e) => setField("username", e.target.value)}
            placeholder="username"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            style={mono}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <label className="mt-4 block text-[11px] text-ink-muted">Theme</label>
        <div className="mt-1 flex items-center justify-between rounded-md border border-line bg-raised px-3 py-2 text-sm text-ink">
          <span className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ background: themes.find((t) => t.id === state.themeId)?.accent }}
            />
            {themes.find((t) => t.id === state.themeId)?.name}
          </span>
          <span className="text-ink-faint" style={mono}>{state.themeId}</span>
        </div>
        <p className="mt-2 text-[10px] text-ink-faint" style={mono}>
          pick below in the gallery
        </p>
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
                onClick={() => toggle(c.id)}
                className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-hover-surface"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="size-2 rounded-full transition-colors"
                    style={{ background: on ? "var(--sg-ember)" : "transparent", outline: on ? "none" : "1px solid var(--sg-border-strong)" }}
                  />
                  <span className={on ? "text-ink" : "text-ink-faint line-through"}>{c.name}</span>
                </span>
                <span className="text-[10px] text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" style={mono}>
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
                  onClick={() => setField("preview", mode)}
                  className="rounded px-2 py-1.5 text-[12px] transition-colors"
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
      onClick={onToggle}
      className="flex w-full items-center justify-between text-left"
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
