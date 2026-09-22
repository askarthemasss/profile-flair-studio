import { useState } from "react";
import { BRAND } from "@sigil/core/brand";
import { BUILTIN_THEMES, getTheme } from "@sigil/core/themes";
import { sigilMarkdown } from "@sigil/core/markdown";
import { CARD_KINDS, DEFAULT_STUDIO, DEMO_PROFILE, type CardKind, type StudioState } from "@/lib/studio-data";
import { toast } from "sonner";
import { ControlRail } from "./ControlRail";
import { ThemeGallery } from "./ThemeGallery";
import { CardGrid } from "./cards";
import { SvgPreview } from "./SvgPreview";

export function Studio() {
  const [state, setState] = useState<StudioState>(DEFAULT_STUDIO);
  const [activeId, setActiveId] = useState<CardKind | null>(null);

  const theme = getTheme(state.themeId);
  const username = state.username.trim() || DEMO_PROFILE.username;
  const profile = { ...DEMO_PROFILE, username };
  const enabledKinds = CARD_KINDS.filter((c) => state.enabled[c.id]).map((c) => c.id);

  const mono = { fontFamily: "var(--font-mono)" } as const;
  const display = { fontFamily: "var(--font-display)" } as const;

  function copyMarkdown() {
    const md = sigilMarkdown({
      username,
      kinds: enabledKinds,
      themeId: theme.id,
      animate: state.animate,
      staticBackup: state.staticBackup,
    });
    void navigator.clipboard?.writeText(md);
    toast.success("Markdown copied", {
      description: `${enabledKinds.length} card snippet${enabledKinds.length === 1 ? "" : "s"} ready to paste into your profile README.`,
    });
  }

  return (
    <div className="min-h-screen bg-obsidian text-ink">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-line bg-obsidian/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="grid size-9 place-items-center rounded-md"
              style={{ background: "var(--sg-bg-1)", border: "1px solid var(--sg-border-strong)" }}
            >
              <span className="text-[17px] leading-none text-ember" style={display}>S</span>
            </div>
            <div className="leading-tight">
              <div className="text-[15px] tracking-tight text-ink" style={display}>{BRAND.name}</div>
              <div className="text-[11px] text-ink-faint" style={mono}>{BRAND.shortTagline}</div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm text-ink-muted md:flex">
            <a href="#" className="transition-colors hover:text-ink">Studio</a>
            <a href="#" className="transition-colors hover:text-ink">Themes</a>
            <a href="#" className="transition-colors hover:text-ink">Docs</a>
            <span className="text-ink-faint" style={mono}>{BRAND.license} · open source</span>
          </nav>

          <div className="flex items-center gap-2">
            <button className="rounded-md border border-line px-3 py-2 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink">
              Sign in
            </button>
            <button
              onClick={copyMarkdown}
              className="sg-breath rounded-md bg-ember px-4 py-2 text-[13px] font-semibold text-obsidian transition-transform hover:scale-[1.02]"
            >
              Copy Markdown
            </button>
          </div>
        </div>
      </header>

      {/* Studio */}
      <main className="mx-auto max-w-[1440px] px-6 py-6 lg:px-8">
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-3">
            <ControlRail state={state} onChange={setState} themes={BUILTIN_THEMES} />
          </div>

          <div className="col-span-12 lg:col-span-9 space-y-5">
            <div className="rounded-lg border border-line bg-panel p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[22px] tracking-tight text-ink" style={display}>
                    The nine marks
                  </h1>
                  <p className="text-[11px] text-ink-faint" style={mono}>
                    @{username} · {theme.name} theme · {state.preview === "svg" ? "served SVG" : "live preview"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={mono}>
                  <span className="size-1.5 rounded-full bg-verdigris" />
                  <span className="text-ink-muted">stale data served instantly · refreshed in background</span>
                </div>
              </div>
            </div>

            {state.preview === "svg" ? (
              <SvgPreview
                kinds={enabledKinds}
                profile={profile}
                theme={theme}
                animate={state.animate}
                live={username.toLowerCase() !== DEMO_PROFILE.username}
              />
            ) : (
              <CardGrid
                kinds={enabledKinds}
                profile={profile}
                theme={theme}
                animate={state.animate}
                activeId={activeId}
                onActive={setActiveId}
              />
            )}

            <ThemeGallery
              themes={BUILTIN_THEMES}
              selected={state.themeId}
              onSelect={(id) => setState({ ...state, themeId: id })}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-line pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-ink-faint" style={mono}>
            <span>{BRAND.name} — {BRAND.tagline}</span>
            <span>{BRAND.license} · open source · sign in with GitHub for your own API quota</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
