import React from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell.js";
import { CardPreview } from "../components/studio/CardPreview.js";
import { getDemoSnapshot } from "../services/snapshot-service.js";
import { BUILTIN_THEMES } from "@sigil/core";
import { ArrowRight, Zap, Shield, Sparkles, Code2, Heart, CheckCircle2 } from "lucide-react";

export const LandingPage: React.FC = () => {
  const demoSnapshot = getDemoSnapshot("torvalds");
  const obsidianTheme = BUILTIN_THEMES.obsidian!;

  return (
    <AppShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-line bg-obsidian py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ember/10 via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left pitch */}
            <div className="flex flex-col gap-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-1 text-xs font-mono text-ember">
                <span className="h-1.5 w-1.5 rounded-full bg-ember animate-ping" />
                <span>Sigil 1.0 · Zero-Runtime SVG Flair</span>
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-6xl lg:leading-[1.1]">
                GitHub flair struck in{" "}
                <span className="text-ember underline decoration-ember/40 decoration-wavy">
                  Obsidian
                </span>
                .
              </h1>

              <p className="text-base text-ink-muted leading-relaxed sm:text-lg">
                Craft pixel-perfect profile flair, activity skylines, streak trackers, and
                achievement matrices. Rendered in under 10ms CPU on Cloudflare Workers with zero
                rasterization.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/studio"
                  className="flex items-center gap-2 rounded-lg bg-ember px-6 py-3 text-sm font-semibold text-obsidian shadow-glow transition-all hover:bg-ember-glow hover:shadow-elevated"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/themes"
                  className="flex items-center gap-2 rounded-lg border border-line bg-panel px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-raised"
                >
                  <span>Browse Themes</span>
                </Link>
              </div>

              {/* Quick trust metrics */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line/60 pt-6">
                <div>
                  <div className="font-display text-xl font-bold text-ink">&lt; 10ms</div>
                  <div className="text-xs font-mono text-ink-faint">Render CPU Time</div>
                </div>
                <div>
                  <div className="font-display text-xl font-bold text-ink">9 Cards</div>
                  <div className="text-xs font-mono text-ink-faint">Full Spectrum</div>
                </div>
                <div>
                  <div className="font-display text-xl font-bold text-ink">Zero Dep</div>
                  <div className="text-xs font-mono text-ink-faint">Pure Vector SVGs</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview */}
            <div className="relative lg:col-span-5">
              <div className="relative rounded-2xl border border-line bg-panel p-3 shadow-elevated">
                <div className="flex items-center justify-between border-b border-line pb-2 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-crimson/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-gold/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-verdigris/80" />
                  </div>
                  <span className="font-mono text-[10px] text-ink-faint">
                    sigil.dev/c/overview/torvalds
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  <CardPreview
                    card={{ uid: "hero-overview", card: "overview", params: { show_rank: "1" } }}
                    snapshot={demoSnapshot}
                    theme={obsidianTheme}
                  />
                  <CardPreview
                    card={{ uid: "hero-streak", card: "streak", params: {} }}
                    snapshot={demoSnapshot}
                    theme={obsidianTheme}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="border-b border-line bg-panel py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              Engineered for developer aesthetics
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              Every detail is calibrated to eliminate generic templates and flat SVG noise.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-line bg-obsidian p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ember/10 text-ember mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-ink">
                Sub-10ms Edge Execution
              </h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Rendered on Cloudflare Workers using pure string ops. No headless Chrome, no canvas,
                no puppeteer, no warm-up delays.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-obsidian p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-azure/10 text-azure mb-4">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-ink">First-Class Themes</h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Every card shares one design language, and themes are first-class: pick a builtin
                theme or submit your own to the community gallery.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-obsidian p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verdigris/10 text-verdigris mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-ink">
                Autonomous GitHub Action
              </h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Prefer self-hosting? The bundled Node 20 GitHub Action renders the cards inside your
                own repository with zero external server dependencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-obsidian py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Ready to design your flair pack?
          </h2>
          <p className="mt-3 text-xs text-ink-muted">
            No signup required to design and export your flair in the interactive studio.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/studio"
              className="rounded-md bg-ember px-6 py-2.5 text-xs font-semibold text-obsidian shadow-glow hover:bg-ember-glow transition-all"
            >
              Launch Studio Now
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
};
