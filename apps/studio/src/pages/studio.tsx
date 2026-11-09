import React, { useMemo } from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { ControlPanel } from "../components/studio/ControlPanel.js";
import { PackList } from "../components/studio/PackList.js";
import { CardPreview } from "../components/studio/CardPreview.js";
import { ExportPanel } from "../components/studio/ExportPanel.js";
import { Reveal } from "../components/ui/Reveal.js";
import { SectionTitle } from "../components/ui/SectionTitle.js";
import { useStudioStore } from "../store/studio-store.js";
import { useSnapshot } from "../hooks/useSnapshot.js";
import { resolveTheme } from "@sigil/core";
import { getDemoSnapshot } from "../services/snapshot-service.js";
import { SnapshotError } from "../services/github-rest.js";
import { Loader2, TriangleAlert, Users } from "lucide-react";

export const StudioPage: React.FC = () => {
  const { user, theme, overrides, cards } = useStudioStore();
  const {
    data: snapshot,
    isLoading,
    isFetching,
    isError,
    error,
    handle: snapshotHandle,
  } = useSnapshot(user);

  const demoSnapshot = useMemo(() => getDemoSnapshot(user || "torvalds"), [user]);
  const activeSnapshot = snapshot ?? demoSnapshot;
  const resolvedTheme = useMemo(() => resolveTheme(theme, overrides), [theme, overrides]);
  const isLookingUp = isLoading || isFetching;
  const notFound = error instanceof SnapshotError && error.kind === "not_found";
  const fallbackNote = snapshot
    ? "Showing the last loaded data."
    : "Showing sample data meanwhile.";
  const snapshotError =
    isError && error instanceof SnapshotError
      ? notFound
        ? `No GitHub user named "${snapshotHandle}". Adjust the handle or check the spelling.`
        : `${error.message}. ${fallbackNote}`
      : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            as="h1"
            kicker="Workbench"
            description="Configure parameters, customize theme variables, and preview cards live."
          >
            Flair Pack Studio
          </SectionTitle>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {isLookingUp ? (
              <span className="notebook-chip notebook-chip--status border-gold/40 bg-gold/10 text-terracotta-ink">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>Fetching @{user.trim() || "..."}</span>
              </span>
            ) : null}
            {!isLookingUp && snapshot && !snapshotError ? (
              <span className="notebook-chip notebook-chip--status border-verdigris/40 bg-verdigris/10 text-verdigris">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Live data for @{snapshot.login}</span>
              </span>
            ) : null}
            {!isLookingUp && !snapshot && !snapshotError ? (
              <span className="notebook-chip notebook-chip--status text-warm-grey">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sample data · press Load for live stats</span>
              </span>
            ) : null}
          </div>
        </div>

        {snapshotError ? (
          <div
            role="alert"
            className="notebook-card mb-6 flex items-start gap-3 border-gold/40 bg-gold/10 px-4 py-3"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-ink" />
            <p className="text-xs leading-relaxed text-soft-black">{snapshotError}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <Reveal>
              <ControlPanel />
            </Reveal>
            <Reveal delay={80}>
              <PackList />
            </Reveal>
            <Reveal delay={160}>
              <ExportPanel />
            </Reveal>
          </div>

          <Reveal delay={60} className="lg:col-span-8">
            <div className="notebook-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="status-dot text-verdigris" aria-hidden="true" />
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal">
                    Live preview ({cards.length} cards)
                  </span>
                </div>
                <span className="font-mono text-[10px] text-warm-grey">
                  {user ? `@${user}` : "demo"} · {resolvedTheme.name}
                </span>
              </div>

              {cards.length === 0 ? (
                <div className="mt-4 flex min-h-[300px] flex-col items-center justify-center rounded-md border border-dashed border-line p-8 text-center">
                  <p className="font-display text-xl font-light tracking-[0.03em] text-charcoal">
                    No cards in this pack
                  </p>
                  <p className="mt-1 text-xs text-warm-grey">
                    Add a card in the pack settings to preview it here.
                  </p>
                </div>
              ) : (
                <div className="preview-canvas mt-4">
                  {cards.map((card) => (
                    <div key={card.uid} className="w-full max-w-[520px]">
                      <CardPreview card={card} snapshot={activeSnapshot} theme={resolvedTheme} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </AppShell>
  );
};
