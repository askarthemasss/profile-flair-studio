import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { Reveal } from "../components/ui/Reveal.js";
import { SectionTitle } from "../components/ui/SectionTitle.js";
import { ENV } from "../lib/env.js";
import { Activity, CheckCircle2, Server, Cpu, Database, Info } from "lucide-react";

export const StatusPage: React.FC = () => {
  const workerConfigured = ENV.HAS_RENDER_API;

  const systems = [
    {
      name: "Studio SPA",
      status: "Operational",
      detail: "Vercel deployment",
      icon: Server,
      ok: true,
    },
    {
      name: "Core SVG Rendering Engine",
      status: "Operational",
      detail: "Client-side previews",
      icon: Cpu,
      ok: true,
    },
    {
      name: "Cloudflare Workers Edge API",
      status: workerConfigured ? "Configured" : "Not configured",
      detail: workerConfigured ? "VITE_RENDER_API_URL is set" : "Browser fallback active",
      icon: Server,
      ok: workerConfigured,
    },
    {
      name: "GitHub GraphQL Token",
      status: workerConfigured ? "Not verified" : "Not configured",
      detail: workerConfigured ? "Worker secret · not checked" : "Requires a deployed Worker",
      icon: Activity,
      ok: false,
    },
    {
      name: "Snapshot Cache",
      status: workerConfigured ? "Edge cache" : "Browser cache",
      detail: workerConfigured ? "4 h fresh · 7 d retained" : "10 min in-browser cache",
      icon: Database,
      ok: workerConfigured,
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-line pb-6">
          <SectionTitle
            as="h1"
            kicker="Configuration"
            description="What this build is connected to, and what still needs a deployed render Worker."
          >
            System Status
          </SectionTitle>
        </div>

        <Reveal>
          <div
            className={`notebook-card mb-8 flex items-start gap-3 border p-4 ${
              workerConfigured ? "border-verdigris/30 bg-verdigris/10" : "border-gold/40 bg-gold/10"
            }`}
          >
            {workerConfigured ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-verdigris" />
            ) : (
              <Info className="mt-0.5 h-6 w-6 flex-shrink-0 text-terracotta-ink" />
            )}
            <div>
              <h2 className="font-display text-lg font-normal tracking-[0.02em] text-charcoal">
                {workerConfigured
                  ? "Render API configured"
                  : "Studio operational · API not configured"}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-soft-black">
                {workerConfigured
                  ? "This build points at a render Worker. Check its /health endpoint for live telemetry. The GitHub token is a Worker secret and is not verified here."
                  : "This build uses the browser-side GitHub fallback. Live card embeds require a deployed Worker and VITE_RENDER_API_URL."}
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
                      <span className="font-mono text-[10px] text-warm-grey">{system.detail}</span>
                    </div>
                  </div>

                  <span
                    className={`notebook-chip notebook-chip--status shrink-0 whitespace-nowrap ${
                      system.ok
                        ? "bg-verdigris/15 text-verdigris"
                        : "bg-gold/15 text-terracotta-ink"
                    }`}
                  >
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
