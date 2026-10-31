import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { ControlPanel } from "../components/studio/ControlPanel.js";
import { PackList } from "../components/studio/PackList.js";
import { CardPreview } from "../components/studio/CardPreview.js";
import { ExportPanel } from "../components/studio/ExportPanel.js";
import { useStudioStore } from "../store/studio-store.js";
import { useSnapshot } from "../hooks/useSnapshot.js";
import { resolveTheme } from "@sigil/core";
import { getDemoSnapshot } from "../services/snapshot-service.js";
import { Loader2 } from "lucide-react";

export const StudioPage: React.FC = () => {
  const { user, theme, overrides, cards } = useStudioStore();
  const { data: snapshot, isLoading } = useSnapshot(user);

  const activeSnapshot = snapshot ?? getDemoSnapshot(user || "torvalds");
  const resolvedTheme = resolveTheme(theme, overrides);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Flair Pack Studio
            </h1>
            <p className="text-xs text-ink-muted">
              Configure parameters, customize theme variables, and preview cards live.
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-xs text-ink-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-ember" />
              <span>Fetching snapshot...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Controls & Cards list */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <ControlPanel />
            <PackList />
            <ExportPanel />
          </div>

          {/* Right Live Canvas */}
          <div className="lg:col-span-8">
            <div className="flex flex-col gap-4 rounded-xl border border-line bg-panel p-6 shadow-card">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-verdigris" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                    Live Preview ({cards.length} cards)
                  </span>
                </div>
                <span className="font-mono text-[11px] text-ink-faint">
                  {user ? `@${user}` : "demo"} · {resolvedTheme.name}
                </span>
              </div>

              {cards.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-line p-8 text-center text-ink-faint">
                  <p className="text-sm font-medium">No cards in this pack</p>
                  <p className="text-xs">Add a card in the Pack Settings to preview here.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 py-4">
                  {cards.map((card) => (
                    <div
                      key={card.uid}
                      className="w-full max-w-[520px] rounded-lg transition-transform hover:scale-[1.01]"
                    >
                      <CardPreview card={card} snapshot={activeSnapshot} theme={resolvedTheme} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
