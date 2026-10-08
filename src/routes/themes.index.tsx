import { createFileRoute, Link } from "@tanstack/react-router";
import { BUILTIN_THEMES } from "@sigil/core/themes";
import { renderCardSvg } from "@sigil/core/render/svg";

import { MarketingShell, PageHeading } from "@/components/layout/MarketingShell";
import { RouteError } from "@/components/layout/RouteError";
import { DEMO_PROFILE } from "@/lib/studio-data";

const mono = { fontFamily: "var(--font-mono)" } as const;

export const Route = createFileRoute("/themes/")({
  head: () => ({
    meta: [
      { title: "Themes — community palettes for Sigil cards" },
      {
        name: "description",
        content:
          "Six built-in themes for your GitHub profile cards — obsidian, paper, verdigris, monolith, tidepool, sandstone. Every theme passes a WCAG contrast check.",
      },
      { property: "og:title", content: "Sigil themes — community palettes" },
      {
        property: "og:description",
        content: "Six contrast-checked card palettes, with more contributed by pull request.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: RouteError,
  component: ThemesPage,
});

function ThemesPage() {
  return (
    <MarketingShell>
      <PageHeading
        eyebrow={`${BUILTIN_THEMES.length} built-in`}
        title="Themes are first-class"
        lede="A theme is one colour set shared by every card in your pack. All of them pass a WCAG contrast check: text at 4.5:1, accent at 3:1. New themes arrive by pull request."
      />

      <section className="mt-8 rounded-lg border border-line bg-panel p-5 shadow-card">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
          Contribute a theme
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-4 text-[13px] leading-relaxed text-ink-muted">
          <li>
            Add <span style={mono}>packages/core/src/themes/builtin/&lt;id&gt;.ts</span> exporting a{" "}
            <span style={mono}>CardTheme</span>. The id is 2–40 characters: lowercase letters,
            numbers, and hyphens. Copy <span style={mono}>obsidian.ts</span> and change the colours.
          </li>
          <li>
            Register the export in{" "}
            <span style={mono}>packages/core/src/themes/builtin/index.ts</span> so the gallery, the
            studio, and the card URLs can resolve it.
          </li>
          <li>
            Run <span style={mono}>bun run check</span>. Text and muted on the background must be at
            least 4.5:1. Accent and gold must be at least 3:1. The check fails the pull request
            otherwise.
          </li>
        </ol>
        <a
          href="https://github.com/askarthemasss/profile-flair-studio/blob/main/packages/core/src/themes/builtin/obsidian.ts"
          className="mt-4 inline-block text-[12px] text-ember"
          style={mono}
        >
          obsidian.ts →
        </a>
      </section>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BUILTIN_THEMES.map((theme) => (
          <Link
            key={theme.id}
            to="/themes/$id"
            params={{ id: theme.id }}
            className="group rounded-lg border border-line p-4 transition-colors hover:border-line-strong"
            style={{ background: theme.bg }}
          >
            <div
              className="[&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{
                __html: renderCardSvg({
                  kind: "overview",
                  profile: DEMO_PROFILE,
                  theme,
                  animate: false,
                }),
              }}
            />
            <div className="mt-3 flex items-center justify-between">
              <span
                className="text-[15px]"
                style={{ color: theme.text, fontFamily: "var(--font-display)" }}
              >
                {theme.name}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.14em]"
                style={{ color: theme.muted, ...mono }}
              >
                {theme.mode}
              </span>
            </div>
            <p className="mt-1 text-[11px]" style={{ color: theme.muted, ...mono }}>
              {theme.feel}
            </p>
          </Link>
        ))}
      </div>
    </MarketingShell>
  );
}
