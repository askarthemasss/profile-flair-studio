import { missingProfile } from "@sigil/core/build-profile";
import { normalizeUsername } from "@sigil/core/profile";
import { BUILTIN_THEMES, getTheme } from "@sigil/core/themes";
import { PanelRight } from "lucide-react";
import { useState } from "react";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  CARD_KINDS,
  DEFAULT_STUDIO,
  DEMO_PROFILE,
  type CardKind,
  type SigilProfile,
  type StudioState,
} from "@/lib/studio-data";
import { liveProfileNote, useLiveProfile } from "@/lib/use-live-profile";
import { CardGrid } from "./cards";
import { ControlRail } from "./ControlRail";
import { ExportPanel } from "./ExportPanel";
import { SvgPreview } from "./SvgPreview";

const mono = { fontFamily: "var(--font-mono)" } as const;
const display = { fontFamily: "var(--font-display)" } as const;

type Tab = "controls" | "preview" | "export";

export function StudioWorkspace({
  initialUsername,
  initialThemeId,
}: {
  initialUsername?: string;
  initialThemeId?: string;
}) {
  const [state, setState] = useState<StudioState>({
    ...DEFAULT_STUDIO,
    username: initialUsername ?? DEFAULT_STUDIO.username,
    themeId: initialThemeId ?? DEFAULT_STUDIO.themeId,
  });
  const [activeId, setActiveId] = useState<CardKind | null>(null);
  const [tab, setTab] = useState<Tab>("preview");

  const theme = getTheme(state.themeId);
  const typed = state.username.trim();
  const normalized = normalizeUsername(typed);
  const username = normalized ?? (typed.replace(/^@/, "") || DEMO_PROFILE.username);
  const wantsLive = Boolean(normalized && normalized !== DEMO_PROFILE.username);
  const live = useLiveProfile(wantsLive ? normalized : null);
  const invalid = typed.length > 0 && !normalized;
  const status = invalid
    ? { note: "That is not a valid GitHub login.", warn: true }
    : liveProfileNote(wantsLive ? live.phase : "idle");
  const sourceLabel = invalid
    ? "invalid login"
    : !wantsLive
      ? "sample pack"
      : state.preview === "svg"
        ? "served SVG"
        : live.phase === "ready"
          ? "live GitHub data"
          : live.phase === "missing"
            ? "no public profile"
            : live.phase === "error"
              ? "GitHub quiet"
              : "loading GitHub";
  const profile: SigilProfile | null = !wantsLive
    ? { ...DEMO_PROFILE, username: normalized ?? DEMO_PROFILE.username }
    : live.phase === "ready" && live.profile
      ? live.profile
      : live.phase === "missing" && normalized
        ? missingProfile(normalized)
        : null;
  let svgProfile = profile;
  if (!svgProfile && wantsLive && normalized) {
    svgProfile = { ...DEMO_PROFILE, username: normalized, name: normalized };
  }
  const enabledKinds = CARD_KINDS.filter((c) => state.enabled[c.id]).map((c) => c.id);

  const controls = (
    <ControlRail
      state={state}
      onChange={setState}
      themes={BUILTIN_THEMES}
      usernameNote={status.note}
      usernameWarn={status.warn}
    />
  );
  const exportPanel = (
    <ExportPanel
      username={username}
      kinds={enabledKinds}
      themeId={theme.id}
      animate={state.animate}
      staticBackup={state.staticBackup}
    />
  );
  const preview =
    state.preview === "svg" && svgProfile ? (
      <SvgPreview
        kinds={enabledKinds}
        profile={svgProfile}
        theme={theme}
        animate={state.animate}
        live={wantsLive}
      />
    ) : profile ? (
      <CardGrid
        kinds={enabledKinds}
        profile={profile}
        theme={theme}
        animate={state.animate}
        activeId={activeId}
        onActive={setActiveId}
      />
    ) : (
      <p
        className="rounded-lg border border-line bg-panel px-4 py-8 text-center text-[12px] text-ink-muted"
        style={mono}
      >
        {status.note}
      </p>
    );

  const canvasHeader = (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-line bg-panel px-4 py-3">
      <div className="min-w-0">
        <h1 className="truncate text-[18px] tracking-tight text-ink" style={display}>
          The nine marks
        </h1>
        <p className="truncate text-[10.5px] text-ink-faint" style={mono}>
          @{username} · {theme.name} · {sourceLabel}
        </p>
      </div>
      <Sheet>
        <SheetTrigger className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-2 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink lg:hidden">
          <PanelRight className="size-3.5" /> Export
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto border-line bg-obsidian">
          <div className="mt-6">{exportPanel}</div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-obsidian text-ink">
      <SiteHeader />

      {/* Desktop + tablet */}
      <div className="hidden min-h-0 flex-1 md:flex">
        <aside className="w-[320px] shrink-0 overflow-y-auto border-r border-line p-4">
          {controls}
        </aside>
        <section className="sg-canvas min-h-0 flex-1 overflow-y-auto p-4">
          {canvasHeader}
          <div className="mt-4">{preview}</div>
        </section>
        <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-line p-4 lg:block">
          {exportPanel}
        </aside>
      </div>

      {/* Mobile */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <div className="grid shrink-0 grid-cols-3 gap-1 border-b border-line bg-obsidian p-2">
          {(
            [
              ["controls", "Controls"],
              ["preview", "Preview"],
              ["export", "Export"],
            ] as const
          ).map(([id, label]) => {
            const on = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="rounded-md px-2 py-2 text-[12px] transition-colors"
                style={{
                  background: on ? "var(--sg-ember)" : "transparent",
                  color: on ? "var(--sg-bg-0)" : "var(--sg-ink-1)",
                  ...mono,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {tab === "controls" && controls}
          {tab === "preview" && (
            <div className="space-y-3">
              <p className="truncate text-[10.5px] text-ink-faint" style={mono}>
                @{username} · {theme.name}
              </p>
              {preview}
            </div>
          )}
          {tab === "export" && exportPanel}
        </div>
      </div>
    </div>
  );
}
