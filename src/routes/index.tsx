import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND } from "@sigil/core/brand";
import { missingProfile } from "@sigil/core/build-profile";
import { getTheme } from "@sigil/core/themes";
import { renderCardSvg } from "@sigil/core/render/svg";
import { normalizeUsername } from "@sigil/core/profile";
import { useEffect, useState } from "react";

import { MarketingShell } from "@/components/layout/MarketingShell";
import { RouteError } from "@/components/layout/RouteError";
import { DEMO_PROFILE, type SigilProfile } from "@/lib/studio-data";
import { liveProfileNote, useLiveProfile } from "@/lib/use-live-profile";
import { signInWithGoogle } from "@/lib/auth";

const mono = { fontFamily: "var(--font-mono)" } as const;
const display = { fontFamily: "var(--font-display)" } as const;

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { signin?: boolean } =>
    search["signin"] === true || search["signin"] === "1" || search["signin"] === "true"
      ? { signin: true }
      : {},
  head: () => ({
    meta: [
      { title: "Sigil — Nine living cards for your GitHub profile" },
      {
        name: "description",
        content:
          "Turn any GitHub username into a matching set of animated stat cards. Paste one line of Markdown — no rate-limit errors. Free, open-source, MIT.",
      },
      { property: "og:title", content: "Sigil — Your developer sigil" },
      {
        property: "og:description",
        content: "Nine living cards for your GitHub profile, one line to install.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: RouteError,
  component: Landing,
});

const HERO_KINDS = ["banner", "overview", "heatmap"] as const;

function Landing() {
  const { signin } = Route.useSearch();
  const [input, setInput] = useState("");
  const [prompted, setPrompted] = useState(false);

  useEffect(() => {
    if (signin && !prompted) {
      setPrompted(true);
      void signInWithGoogle("/dashboard");
    }
  }, [signin, prompted]);

  const clean = normalizeUsername(input);
  const wantsLive = Boolean(clean && clean !== DEMO_PROFILE.username);
  const live = useLiveProfile(wantsLive ? clean : null);
  const invalid = input.trim().length > 0 && !clean;
  const status = invalid
    ? { note: "That is not a valid GitHub login.", warn: true }
    : liveProfileNote(wantsLive ? live.phase : "idle");
  const profile: SigilProfile | null = !wantsLive
    ? DEMO_PROFILE
    : live.phase === "ready" && live.profile
      ? live.profile
      : live.phase === "missing" && clean
        ? missingProfile(clean)
        : null;
  const theme = getTheme("obsidian");

  return (
    <MarketingShell>
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ember" style={mono}>
            {BRAND.license} · open source · zero config
          </p>
          <h1
            className="mt-4 text-[38px] leading-[1.05] tracking-tight text-ink md:text-[54px]"
            style={display}
          >
            Your developer sigil,
            <br />
            struck in obsidian.
          </h1>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink-muted">
            Nine cards — overview, streak, languages, heatmap, skyline, activity, achievements,
            repo, banner — sharing one design language. Type a username, pick a theme, paste one
            line of Markdown. No rate-limit errors, ever: stale data is served instantly and
            refreshed in the background.
          </p>

          <div className="mt-7 max-w-md">
            <label className="block text-[11px] text-ink-muted">GitHub username</label>
            <div className="sg-ledger mt-1 flex items-center gap-2 px-1 py-2.5">
              <span className="text-ink-faint" style={mono}>
                @
              </span>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={DEMO_PROFILE.username}
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
                style={mono}
              />
            </div>
            <p
              className={`mt-2 text-[10px] ${status.warn ? "text-ember" : "text-ink-faint"}`}
              style={mono}
            >
              {status.note}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/studio"
              search={clean ? { user: clean, theme: "obsidian" } : {}}
              className="sg-breath rounded-md bg-ember px-5 py-2.5 text-[13px] font-semibold text-obsidian transition-transform hover:scale-[1.02]"
            >
              Open the studio
            </Link>
            <Link
              to="/themes"
              className="rounded-md border border-line px-5 py-2.5 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              Browse themes
            </Link>
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          {profile ? (
            HERO_KINDS.map((kind) => (
              <div
                key={kind}
                className="[&_svg]:h-auto [&_svg]:w-full"
                dangerouslySetInnerHTML={{
                  __html: renderCardSvg({ kind, profile, theme, animate: true }),
                }}
              />
            ))
          ) : (
            <p
              className="rounded-lg border border-line bg-panel px-4 py-10 text-center text-[12px] text-ink-muted"
              style={mono}
            >
              {status.note}
            </p>
          )}
        </div>
      </section>

      <section className="mt-16 grid gap-4 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Reliable", "Never an error card. Cached stats are served instantly, refreshed behind the scenes."],
          ["Beautiful", "Nine cards, one design language. Themes are first-class and community-made."],
          ["Zero-config", "A username is enough. Sign in only if you want your own API quota."],
          ["Independent", "A GitHub Action commits still SVGs into your repo, so your profile survives us."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-line bg-panel p-5 shadow-card">
            <h2 className="text-[17px] tracking-tight text-ink" style={display}>
              {title}
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">{body}</p>
          </div>
        ))}
      </section>
    </MarketingShell>
  );
}
