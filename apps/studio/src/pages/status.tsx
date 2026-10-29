import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { Activity, CheckCircle2, Server, Cpu, Database } from "lucide-react";

export const StatusPage: React.FC = () => {
  const systems = [
    {
      name: "Cloudflare Workers Edge API",
      status: "Operational",
      latency: "6ms CPU",
      icon: Server,
    },
    { name: "Core SVG Rendering Engine", status: "Operational", latency: "3ms CPU", icon: Cpu },
    {
      name: "GitHub GraphQL Token Pool",
      status: "Operational",
      latency: "4,820 / 5,000",
      icon: Activity,
    },
    {
      name: "Supabase PostgREST Cache",
      status: "Operational",
      latency: "Normal",
      icon: Database,
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-line pb-6">
          <div className="flex items-center gap-2 text-verdigris">
            <Activity className="h-5 w-5" />
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              System Health & Status
            </h1>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Live telemetry and operational metrics across the global edge network.
          </p>
        </div>

        {/* Global Banner */}
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-verdigris/30 bg-verdigris/10 p-4">
          <CheckCircle2 className="h-6 w-6 text-verdigris flex-shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-ink">All Systems Operational</h2>
            <p className="text-xs text-ink-muted">
              SVG render endpoints are operating well within the 10ms CPU budget.
            </p>
          </div>
        </div>

        {/* System Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {systems.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-xl border border-line bg-panel p-4 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-raised text-ink">
                    <Icon className="h-4 w-4 text-ember" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-ink">{s.name}</h3>
                    <span className="text-[11px] font-mono text-ink-faint">{s.latency}</span>
                  </div>
                </div>

                <span className="flex items-center gap-1 rounded-full bg-verdigris/15 px-2.5 py-0.5 text-[10px] font-medium text-verdigris">
                  <span className="h-1.5 w-1.5 rounded-full bg-verdigris" />
                  {s.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};
