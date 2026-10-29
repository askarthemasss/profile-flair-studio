import React, { useState } from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { ThemeGrid } from "../components/themes/ThemeGrid.js";
import { ThemeSubmitDialog } from "../components/themes/ThemeSubmitDialog.js";
import { Plus, Palette } from "lucide-react";

export const ThemesPage: React.FC = () => {
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-2 text-ember">
              <Palette className="h-5 w-5" />
              <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Theme Gallery
              </h1>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Curated and community-contributed themes with contrast ratios and custom heat ramps.
            </p>
          </div>

          <button
            onClick={() => setSubmitOpen(true)}
            className="flex items-center gap-1.5 self-start sm:self-auto rounded-md bg-ember px-4 py-2 text-xs font-semibold text-obsidian shadow-glow hover:bg-ember-glow transition-all"
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
