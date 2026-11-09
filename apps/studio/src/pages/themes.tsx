import React, { useState } from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { ThemeGrid } from "../components/themes/ThemeGrid.js";
import { ThemeSubmitDialog } from "../components/themes/ThemeSubmitDialog.js";
import { SectionTitle } from "../components/ui/SectionTitle.js";
import { Plus } from "lucide-react";

export const ThemesPage: React.FC = () => {
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            as="h1"
            kicker="Gallery"
            description="Curated and community-contributed themes with contrast ratios and custom heat ramps."
          >
            Theme Gallery
          </SectionTitle>

          <button
            onClick={() => setSubmitOpen(true)}
            className="notebook-btn notebook-btn--primary self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Submit Theme</span>
          </button>
        </div>

        <ThemeGrid />

        <ThemeSubmitDialog open={submitOpen} onClose={() => setSubmitOpen(false)} />
      </div>
    </AppShell>
  );
};
