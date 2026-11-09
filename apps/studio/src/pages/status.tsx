import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { Reveal } from "../components/ui/Reveal.js";
import { SectionTitle } from "../components/ui/SectionTitle.js";
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
      name: "Cloudflare Edge Snapshot Cache",
      status: "Operational",
      latency: "Normal",
      icon: Database,
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-line pb-6">
          <SectionTitle
            as="h1"
            kicker="Telemetry"
            description="Live telemetry and operational metrics across the global edge network."
          >
            System Health &amp; Status
          </SectionTitle>
        </div>

        <Reveal>
          <div className="notebook-card mb-8 flex items-start gap-3 border-verdigris/30 bg-verdigris/10 p-4">
            <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-verdigris" />
            <div>
              <h2 className="font-display text-lg font-normal tracking-[0.02em] text-charcoal">
                All Systems Operational
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-soft-black">
                SVG render endpoints are operating well within the 10ms CPU budget.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {systems.map((system, index) => {
            const Icon = system.icon;
            return (
              <Reveal key={system.name} delay={index * 60}>
                <div className="notebook-card flex items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="notebook-icon h-9 w-9 shrink-0">
                      <Icon className="h-4 w-4 text-terracotta" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-normal leading-snug tracking-[0.02em] text-charcoal">
                        {system.name}
                      </h3>
                      <span className="font-mono text-[10px] text-warm-grey">{system.latency}</span>
                    </div>
                  </div>

                  <span className="notebook-chip notebook-chip--status shrink-0 whitespace-nowrap bg-verdigris/15 text-verdigris">
                    <span className="status-dot" aria-hidden="true" />
                    {system.status}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};
