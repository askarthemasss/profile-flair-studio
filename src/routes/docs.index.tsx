import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND } from "@sigil/core/brand";
import { BUILTIN_THEMES } from "@sigil/core/themes";

import { MarketingShell, PageHeading } from "@/components/layout/MarketingShell";
import { RouteError } from "@/components/layout/RouteError";
import { CARD_KINDS } from "@/lib/studio-data";

const mono = { fontFamily: "var(--font-mono)" } as const;
const display = { fontFamily: "var(--font-display)" } as const;

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Sigil card URLs and JSON API" },
      {
        name: "description",
        content:
          "Reference for every Sigil card URL, the query parameters they accept, the public JSON API, and the GitHub Action that commits static backups.",
      },
      { property: "og:title", content: "Sigil docs — card URLs and JSON API" },
      {
        property: "og:description",
        content: "One URL per card, a public JSON API, and a static-backup GitHub Action.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: RouteError,
  component: DocsPage,
});

function DocsPage() {
  return (
    <MarketingShell>
      <PageHeading
        eyebrow="Reference"
        title="One URL per card"
        lede="Every card is a plain image URL. Drop it in a Markdown image tag and GitHub renders it. No build step, no token, no configuration."
      />

      <section className="mt-10 rounded-lg border border-line bg-panel p-5 shadow-card">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
          Shape
        </h2>
        <pre className="mt-3 overflow-x-auto rounded-md border border-line bg-raised p-3 text-[11.5px] text-ink-muted" style={mono}>
{`${BRAND.baseUrl}/c/<card>/<username>?theme=<theme>&animate=<0|1>

![Sigil stats](${BRAND.baseUrl}/c/stats/octocat?theme=obsidian&animate=1)`}
        </pre>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["card", `one of ${CARD_KINDS.length} card kinds`],
            ["theme", `${BUILTIN_THEMES.map((t) => t.id).join(", ")}`],
            ["animate", "1 for living cards, 0 for still"],
          ].map(([term, value]) => (
            <div key={term}>
              <dt className="text-[11px] text-ember" style={mono}>
                {term}
              </dt>
              <dd className="mt-1 text-[12px] leading-relaxed text-ink-muted">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <h2 className="mt-12 text-[24px] tracking-tight text-ink" style={display}>
        The nine cards
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_KINDS.map((card) => (
          <Link
            key={card.id}
            to="/docs/$card"
            params={{ card: card.id }}
            className="rounded-lg border border-line bg-panel p-4 transition-colors hover:border-line-strong"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-ink" style={display}>
                {card.name}
              </span>
              <span className="text-[10px] text-ink-faint" style={mono}>
                {card.id}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">{card.hint}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-[24px] tracking-tight text-ink" style={display}>
        Public JSON API
      </h2>
      <pre className="mt-3 overflow-x-auto rounded-md border border-line bg-raised p-3 text-[11.5px] text-ink-muted" style={mono}>
{`GET /api/v1/users/:username   → the same stats the cards draw
GET /api/v1/themes            → every built-in theme`}
      </pre>

      <h2 className="mt-12 text-[24px] tracking-tight text-ink" style={display}>
        Static backups
      </h2>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
        The Sigil GitHub Action fetches your pack once a day and commits the SVGs into your own
        repository, so your README keeps rendering even if this service disappears.
      </p>
      <pre className="mt-3 overflow-x-auto rounded-md border border-line bg-raised p-3 text-[11.5px] text-ink-muted" style={mono}>
{`- uses: sigil/action@v1
  with:
    username: octocat
    theme: obsidian
    out: ./sigil`}
      </pre>
    </MarketingShell>
  );
}
