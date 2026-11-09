import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { PresetList } from "../components/presets/PresetList.js";
import { SectionTitle } from "../components/ui/SectionTitle.js";

export const PresetsPage: React.FC = () => {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-line pb-6">
          <SectionTitle
            as="h1"
            kicker="Library"
            description="Save and reload card packs. Presets are stored locally in your browser."
          >
            Preset Library
          </SectionTitle>
        </div>

        <PresetList />
      </div>
    </AppShell>
  );
};
