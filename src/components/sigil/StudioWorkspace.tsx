import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { BUILTIN_THEMES, getTheme } from "@sigil/core/themes";
import { PanelRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signInWithGoogle, useSession } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  applyPackToState,
  claimPackDraft,
  normalizePackName,
  packParamsFromState,
  parsePackParams,
  stashPackDraft,
  takePackDraft,
  type PackParams,
} from "@/lib/pack";
import { readCardPreset, writeCardPreset } from "@/lib/pack-store";
import {
  CARD_KINDS,
  DEFAULT_STUDIO,
  DEMO_PROFILE,
  type CardKind,
  type StudioState,
} from "@/lib/studio-data";
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
  initialPackId,
}: {
  initialUsername?: string;
  initialThemeId?: string;
  initialPackId?: string;
}) {
  const [state, setState] = useState<StudioState>({
    ...DEFAULT_STUDIO,
    username: initialUsername ?? DEFAULT_STUDIO.username,
    themeId: initialThemeId ?? DEFAULT_STUDIO.themeId,
  });
  const [activeId, setActiveId] = useState<CardKind | null>(null);
  const [tab, setTab] = useState<Tab>("preview");
  const [packId, setPackId] = useState<string | null>(null);
  const [packName, setPackName] = useState("My pack");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retained, setRetained] = useState<PackParams | null>(null);
  const [opened, setOpened] = useState<{ id: string; userId: string } | null>(null);
  const [opening, setOpening] = useState(Boolean(initialPackId));
  const appliedPack = useRef<string | null>(null);
  const { session, loading: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialPackId) return;
    const draft = claimPackDraft();
    if (!draft) return;
    setPackName(draft.name);
    setIsPublic(draft.isPublic);
    setPackId(draft.packId);
    setRetained(draft.params);
    setState((current) => applyPackToState(current, draft.params));
    toast.message("Signed in", { description: "Your pack is ready — save it to the dashboard." });
  }, [initialPackId]);

  useEffect(() => {
    if (!initialPackId || appliedPack.current === initialPackId) {
      setOpening(false);
      return;
    }
    let cancel = false;
    setOpening(true);
    void (async () => {
      const row = await readCardPreset(initialPackId);
      if (cancel) return;
      appliedPack.current = initialPackId;
      setOpening(false);
      if (row === null || "error" in row) {
        toast.error("Could not open that pack", {
          description: row && "error" in row ? row.error : "It may be private.",
        });
        return;
      }
      const params = parsePackParams(row.params);
      if (!params) {
        toast.error("That pack is missing its cards");
        return;
      }
      setPackName(row.name);
      setIsPublic(row.isPublic);
      setRetained(params);
      setOpened({ id: row.id, userId: row.userId });
      setState((current) => applyPackToState(current, params));
    })();
    return () => {
      cancel = true;
    };
  }, [initialPackId]);

  useEffect(() => {
    if (!opened || sessionLoading) return;
    if (appliedPack.current !== opened.id) return;
    setPackId(session?.user.id === opened.userId ? opened.id : null);
  }, [opened, session?.user.id, sessionLoading]);

  async function persist(userId: string, name: string, params: PackParams) {
    setSaving(true);
    const result = await writeCardPreset({
      userId,
      packId,
      name,
      isPublic,
      params,
    });
    setSaving(false);
    if ("error" in result) {
      toast.error("Could not save the pack", { description: result.error });
      return;
    }
    appliedPack.current = result.id;
    setPackId(result.id);
    setPackName(name);
    setRetained(params);
    await queryClient.invalidateQueries({ queryKey: ["presets"] });
    toast.success(
      result.copied ? "Saved a copy of this pack" : packId ? "Pack updated" : "Pack saved",
      {
        description: "It is on your dashboard.",
      },
    );
    void navigate({
      to: "/studio",
      search: (prev) => ({ ...prev, pack: result.id }),
      replace: true,
    });
  }

  async function savePack() {
    const name = normalizePackName(packName);
    if (!name) {
      toast.error("Name the pack", { description: "Use between 1 and 60 characters." });
      return;
    }
    const params = packParamsFromState(state, retained);
    if (!session) {
      stashPackDraft({ name, isPublic, packId, params });
      const signedIn = await signInWithGoogle("/studio");
      if (!signedIn) return;
      takePackDraft();
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      await persist(data.session.user.id, name, params);
      return;
    }
    await persist(session.user.id, name, params);
  }

  const theme = getTheme(state.themeId);
  const username = state.username.trim() || DEMO_PROFILE.username;
  const profile = { ...DEMO_PROFILE, username };
  const enabledKinds = CARD_KINDS.filter((c) => state.enabled[c.id]).map((c) => c.id);

  const controls = <ControlRail state={state} onChange={setState} themes={BUILTIN_THEMES} />;
  function renderExport() {
    return (
      <ExportPanel
        username={username}
        kinds={enabledKinds}
        themeId={theme.id}
        animate={state.animate}
        staticBackup={state.staticBackup}
        packName={packName}
        isPublic={isPublic}
        saving={saving}
        sessionLoading={sessionLoading || opening}
        signedIn={Boolean(session)}
        editing={packId !== null}
        onPackName={setPackName}
        onPublic={setIsPublic}
        onSave={() => void savePack()}
      />
    );
  }
  const preview =
    state.preview === "svg" ? (
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
    );

  const canvasHeader = (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-line bg-panel px-4 py-3">
      <div className="min-w-0">
        <h1 className="truncate text-[18px] tracking-tight text-ink" style={display}>
          {packId ? packName : "The nine marks"}
        </h1>
        <p className="truncate text-[10.5px] text-ink-faint" style={mono}>
          @{username} · {theme.name} · {state.preview === "svg" ? "served SVG" : "live preview"}
        </p>
      </div>
      <Sheet>
        <SheetTrigger className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-2 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink lg:hidden">
          <PanelRight className="size-3.5" /> Export
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto border-line bg-obsidian"
        >
          <div className="mt-6">{renderExport()}</div>
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
          {renderExport()}
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
          {tab === "export" && renderExport()}
        </div>
      </div>
    </div>
  );
}
