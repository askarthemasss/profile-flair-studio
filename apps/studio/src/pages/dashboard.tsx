import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { ConnectionCard } from "../components/dashboard/ConnectionCard.js";
import { PresetList } from "../components/dashboard/PresetList.js";
import { DangerZone } from "../components/dashboard/DangerZone.js";
import { LayoutDashboard } from "lucide-react";

export const DashboardPage: React.FC = () => {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-line pb-6">
          <div className="flex items-center gap-2 text-ember">
            <LayoutDashboard className="h-5 w-5" />
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Account Dashboard
            </h1>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Manage your authenticated token, saved pack presets, and privacy settings.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <ConnectionCard />
          <PresetList />
          <DangerZone />
        </div>
      </div>
    </AppShell>
  );
};
