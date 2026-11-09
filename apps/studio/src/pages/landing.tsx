import React from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell.js";
import { CardPreview } from "../components/studio/CardPreview.js";
import { Reveal } from "../components/ui/Reveal.js";
import { SectionTitle } from "../components/ui/SectionTitle.js";
import { getDemoSnapshot } from "../services/snapshot-service.js";
import { renderHost } from "../lib/render-url.js";
import { BUILTIN_THEMES } from "@sigil/core";
import { ArrowRight, BookOpen, Palette, Shield, Zap } from "lucide-react";

const features = [
  {
    number: "01",
    title: "Sub-10ms edge execution",
    description:
      "Pure string operations on Cloudflare Workers. No headless browser, no canvas, no warm-up delays.",
    icon: Zap,
  },
  {
    number: "02",
    title: "Themes with a point of view",
    description:
      "Six builtin palettes, custom heat ramps, and a community gallery. Your flair should sound like you.",
    icon: Palette,
  },
  {
    number: "03",
    title: "Autonomous GitHub Action",
    description:
      "Self-host the renderer inside your own repository. Zero external servers, zero surprises.",
    icon: Shield,
  },
];

const trustChips = ["Edge-rendered", "Open source", "No signup", "No tracking"];

export const LandingPage: React.FC = () => {
  const demoSnapshot = getDemoSnapshot("torvalds");
  const obsidianTheme = BUILTIN_THEMES.obsidian!;

  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-cream py-16 sm:py-20 lg:py-28">
        <div
          className="margin-thread left-[clamp(16px,5vw,80px)] hidden lg:block"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="flex flex-col gap-6 lg:col-span-7">
              <div className="hero-anim hero-anim--1 inline-flex w-fit items-center gap-2.5 rounded-full border border-line bg-[var(--card-glass)] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                <span className="notebook-kicker text-[0.58rem]">
                  Sigil 1.0 · Zero-runtime SVG flair
                </span>
              </div>

              <h1 className="hero-anim hero-anim--2 font-display text-5xl font-light leading-[1.05] tracking-[0.03em] text-charcoal sm:text-6xl lg:text-7xl">
                GitHub flair, <em className="italic text-terracotta-ink">drawn in ink</em>.
              </h1>

              <p className="hero-anim hero-anim--3 notebook-lede max-w-xl">
                Nine living cards for your profile — activity skylines, streak trackers, language
                ledgers, and achievement matrices. Rendered at the edge in under 10ms, with no
                rasterization.
              </p>

              <div className="hero-anim hero-anim--4 flex flex-wrap items-center gap-3">
                <Link to="/studio" className="notebook-btn notebook-btn--primary">
                  <span>Open the Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/themes" className="notebook-btn notebook-btn--secondary">
                  <Palette className="h-4 w-4" />
                  <span>Browse Themes</span>
                </Link>
              </div>

              <div className="hero-anim hero-anim--5 mt-4 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6">
                <div>
                  <div className="font-display text-2xl font-light tracking-[0.04em] text-charcoal">
                    &lt; 10ms
                  </div>
                  <div className="mt-1 font-sans text-[9px] uppercase tracking-[0.14em] text-warm-grey">
                    Render CPU
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-light tracking-[0.04em] text-charcoal">
                    9 cards
                  </div>
                  <div className="mt-1 font-sans text-[9px] uppercase tracking-[0.14em] text-warm-grey">
                    In the pack
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-light tracking-[0.04em] text-charcoal">
                    0 deps
                  </div>
                  <div className="mt-1 font-sans text-[9px] uppercase tracking-[0.14em] text-warm-grey">
                    Pure vectors
                  </div>
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="hero-orbit hidden lg:block" aria-hidden="true" />
              <div className="notebook-card hero-anim hero-anim--3 relative p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3 border-b border-line px-2 pb-3">
                  <span className="notebook-kicker text-[0.55rem]">Live vector preview</span>
                  <span className="truncate font-mono text-[9px] text-warm-grey">
                    {renderHost()}/c/overview/torvalds
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  <div className="overflow-hidden rounded-md border border-line bg-[var(--card-item-bg)]">
                    <CardPreview
                      card={{ uid: "hero-overview", card: "overview", params: { show_rank: "1" } }}
                      snapshot={demoSnapshot}
                      theme={obsidianTheme}
                    />
                  </div>
                  <div className="overflow-hidden rounded-md border border-line bg-[var(--card-item-bg)]">
                    <CardPreview
                      card={{ uid: "hero-streak", card: "streak", params: {} }}
                      snapshot={demoSnapshot}
                      theme={obsidianTheme}
                    />
                  </div>
                </div>

                <p className="mt-3 px-2 font-display text-xs italic text-warm-grey">
                  A page from @torvalds&rsquo; notebook.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Field notes */}
      <section className="border-b border-line bg-sage py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            kicker="Field notes"
            description="Every detail is calibrated to feel written, not generated. The cards stay quiet so your work can speak."
            className="max-w-2xl"
          >
            Engineered for developer aesthetics
          </SectionTitle>

          <div className="mt-12 grid grid-cols-1 items-start gap-5 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.number} delay={index * 100}>
                  <article className="notebook-card notebook-card--interactive p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="notebook-icon text-terracotta">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-display text-sm italic text-terracotta-ink">
                        {feature.number}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-normal tracking-[0.03em] text-charcoal">
                      {feature.title}
                    </h3>
                    <p className="mt-2 font-sans text-[0.82rem] font-light leading-[1.75] text-soft-black">
                      {feature.description}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing note */}
      <section className="relative overflow-hidden bg-parchment py-20 sm:py-24">
        <div
          className="margin-thread right-[clamp(16px,5vw,80px)] hidden lg:block"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <span
              aria-hidden="true"
              className="mb-4 inline-block font-display text-2xl leading-none text-terracotta"
            >
              ✦
            </span>
            <SectionTitle
              kicker="A blank page"
              align="center"
              description="No signup. Open the studio, arrange your cards, and copy a snippet."
            >
              Ready to design your flair pack?
            </SectionTitle>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/studio" className="notebook-btn notebook-btn--primary">
                <span>Launch the Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/docs" className="notebook-btn notebook-btn--secondary">
                <BookOpen className="h-4 w-4" />
                <span>Read the docs</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {trustChips.map((chip) => (
                <span key={chip} className="notebook-chip">
                  {chip}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
};
