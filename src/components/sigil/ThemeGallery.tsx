import type { CardTheme } from "@sigil/core/themes";

interface Props {
  themes: CardTheme[];
  selected: string;
  onSelect: (id: string) => void;
}

export function ThemeGallery({ themes, selected, onSelect }: Props) {
  const mono = { fontFamily: "var(--font-mono)" } as const;

  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
          Community themes
        </h2>
        <span className="text-[10px] text-ink-faint" style={mono}>{themes.length} built-in · 40+ soon</span>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {themes.map((t) => {
          const active = t.id === selected;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="shrink-0 w-44 rounded-md p-3 text-left transition-all"
              style={{
                background: t.bg,
                border: `1px solid ${active ? t.accent : t.border}`,
                boxShadow: active ? `0 0 0 1px ${t.accent}` : "none",
              }}
            >
              <div className="flex gap-1">
                <span className="size-4 rounded" style={{ background: t.bg, outline: `1px solid ${t.border}` }} />
                <span className="size-4 rounded" style={{ background: t.accent }} />
                <span className="size-4 rounded" style={{ background: t.text }} />
                <span className="size-4 rounded" style={{ background: t.gold }} />
              </div>
              <div className="mt-2 text-[12px]" style={{ color: t.text }}>{t.name}</div>
              <div className="text-[10px]" style={{ color: t.muted, ...mono }}>{t.feel}</div>
              {active && (
                <div className="mt-1.5 text-[9px] uppercase tracking-[0.15em]" style={{ color: t.accent, ...mono }}>
                  active
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
