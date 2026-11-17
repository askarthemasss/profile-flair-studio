import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { ThemeGrid } from "../components/themes/ThemeGrid.js";
import { SectionTitle } from "../components/ui/SectionTitle.js";
import { Plus } from "lucide-react";

const THEME_SUBMISSION_URL =
  "https://github.com/askarthemasss/profile-flair-studio/issues/new?template=theme_submission.yml";

export const ThemesPage: React.FC = () => {
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

          <a
            href={THEME_SUBMISSION_URL}
            target="_blank"
            rel="noreferrer"
            className="notebook-btn notebook-btn--primary self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Submit a Theme</span>
          </a>
        </div>

        <ThemeGrid />
      </div>
    </AppShell>
  );
};
