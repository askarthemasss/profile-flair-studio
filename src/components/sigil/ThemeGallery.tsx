import type { CardTheme } from "@sigil/core/themes";

interface Props {
  themes: CardTheme[];
  selected: string;
  onSelect: (id: string) => void;
}

const mono = { fontFamily: "var(--font-mono)" } as const;

/** Two-column theme picker sized for the 320px studio rail. */
export function ThemeGallery({ themes, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {themes.map((theme) => {
        const active = theme.id === selected;
        return (
          <button
            key={theme.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(theme.id)}
            className="sg-focus min-w-0 rounded-md px-2 py-2 text-left"
            style={{
              background: theme.bg,
              color: theme.text,
              boxShadow: active
                ? `inset 0 0 0 1.5px ${theme.accent}`
                : `inset 0 0 0 1px ${theme.border}`,
            }}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: theme.accent }}
              />
              <span className="truncate text-[12px]">{theme.name}</span>
            </span>
            <span
              className="mt-0.5 block text-[10px] leading-snug"
              style={{ color: theme.muted, ...mono }}
            >
              {theme.feel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
