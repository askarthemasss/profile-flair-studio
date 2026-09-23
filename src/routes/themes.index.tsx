import { createFileRoute, Link } from "@tanstack/react-router";
import { BUILTIN_THEMES } from "@sigil/core/themes";
import { renderCardSvg } from "@sigil/core/render/svg";

import { MarketingShell, PageHeading } from "@/components/layout/MarketingShell";
import { RouteError } from "@/components/layout/RouteError";
import { DEMO_PROFILE } from "@/lib/studio-data";

const mono = { fontFamily: "var(--font-mono)" } as const;

export const Route = createFileRoute("/themes")({
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
                  kind: "stats",
                  profile: DEMO_PROFILE,
                  theme,
                  animate: false,
                }),
              }}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[15px]" style={{ color: theme.text, fontFamily: "var(--font-display)" }}>
                {theme.name}
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: theme.muted, ...mono }}>
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
