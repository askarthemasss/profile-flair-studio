import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { PresetList } from "../components/presets/PresetList.js";
import { Bookmark } from "lucide-react";

export const PresetsPage: React.FC = () => {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-line pb-6">
          <div className="flex items-center gap-2 text-ember">
            <Bookmark className="h-5 w-5" />
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Preset Library</h1>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Save and reload card packs. Presets are stored locally in your browser.
          </p>
        </div>

        <PresetList />
      </div>
    </AppShell>
  );
};
