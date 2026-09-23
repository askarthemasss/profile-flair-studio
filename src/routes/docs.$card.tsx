import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BRAND } from "@sigil/core/brand";
import { getTheme } from "@sigil/core/themes";
import { isCardKind } from "@sigil/core/profile";
import { renderCardSvg } from "@sigil/core/render/svg";

import { MarketingShell } from "@/components/layout/MarketingShell";
import { RouteError } from "@/components/layout/RouteError";
import { CARD_KINDS, DEMO_PROFILE } from "@/lib/studio-data";

const mono = { fontFamily: "var(--font-mono)" } as const;
const display = { fontFamily: "var(--font-display)" } as const;

export const Route = createFileRoute("/docs/$card")({
  loader: ({ params }) => {
    if (!isCardKind(params.card)) throw notFound();
    const card = CARD_KINDS.find((entry) => entry.id === params.card);
    if (!card) throw notFound();
    return { card };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Card unavailable — Sigil docs" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.card.name} card — Sigil docs`;
    const description = `${loaderData.card.hint}. Card URL, query parameters, and a live example for the Sigil ${loaderData.card.id} card.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: RouteError,
  component: CardDoc,
});

function CardDoc() {
  const { card } = Route.useLoaderData();
  const theme = getTheme("obsidian");
  const url = `${BRAND.baseUrl}/c/${card.id}/octocat?theme=obsidian&animate=1`;

  return (
    <MarketingShell>
      <Link to="/docs" className="text-[11px] text-ink-faint transition-colors hover:text-ink" style={mono}>
        ← all cards
      </Link>
      <h1 className="mt-4 text-[34px] leading-tight tracking-tight text-ink md:text-[42px]" style={display}>
        {card.name}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">{card.hint}</p>

      <div className="mt-8 max-w-[520px] [&_svg]:h-auto [&_svg]:w-full">
        <div
          dangerouslySetInnerHTML={{
            __html: renderCardSvg({ kind: card.id, profile: DEMO_PROFILE, theme, animate: true }),
          }}
        />
      </div>

      <h2 className="mt-10 text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
        Markdown
      </h2>
      <pre className="mt-2 overflow-x-auto rounded-md border border-line bg-raised p-3 text-[11.5px] text-ink-muted" style={mono}>
{`![Sigil ${card.id}](${url})`}
      </pre>

      <h2 className="mt-8 text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
        Parameters
      </h2>
      <div className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
        {[
          ["username", "path", "Any public GitHub login. No sign-in required."],
          ["theme", "query", "Theme id. Defaults to obsidian."],
          ["animate", "query", "0 disables motion. Reduced-motion is honoured automatically."],
        ].map(([name, kind, note]) => (
          <div key={name} className="grid gap-1 p-3 sm:grid-cols-[120px_70px_minmax(0,1fr)] sm:items-baseline">
            <span className="text-[12px] text-ember" style={mono}>
              {name}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-ink-faint" style={mono}>
              {kind}
            </span>
            <span className="text-[12.5px] leading-relaxed text-ink-muted">{note}</span>
          </div>
        ))}
      </div>

      <Link
        to="/studio"
        className="sg-breath mt-8 inline-block rounded-md bg-ember px-5 py-2.5 text-[13px] font-semibold text-obsidian"
      >
        Try it in the studio
      </Link>
    </MarketingShell>
  );
}
