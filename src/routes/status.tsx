import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { MarketingShell, PageHeading } from "@/components/layout/MarketingShell";
import { RouteError } from "@/components/layout/RouteError";

const mono = { fontFamily: "var(--font-mono)" } as const;

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status — Sigil service health" },
      {
        name: "description",
        content:
          "Live health of the Sigil card renderer, public JSON API, and theme endpoint, checked from your own browser.",
      },
      { property: "og:title", content: "Sigil status — live service health" },
      {
        property: "og:description",
        content: "Card renderer, JSON API, and theme endpoint checks, run from your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: RouteError,
  component: StatusPage,
});

const CHECKS = [
  { id: "cards", label: "Card renderer", path: "/c/stats/octocat?theme=obsidian&animate=0" },
  { id: "users", label: "Public JSON — users", path: "/api/v1/users/octocat" },
  { id: "themes", label: "Public JSON — themes", path: "/api/v1/themes" },
] as const;

interface CheckResult {
  id: string;
  ok: boolean;
  status: number | null;
  ms: number;
}

function StatusPage() {
  const probe = useQuery({
    queryKey: ["status"],
    refetchInterval: 60_000,
    queryFn: async (): Promise<{ at: string; results: CheckResult[] }> => {
      const results = await Promise.all(
        CHECKS.map(async (check) => {
          const started = performance.now();
          try {
            const response = await fetch(check.path, { cache: "no-store" });
            return {
              id: check.id,
              ok: response.ok,
              status: response.status,
              ms: Math.round(performance.now() - started),
            };
          } catch {
            return { id: check.id, ok: false, status: null, ms: Math.round(performance.now() - started) };
          }
        }),
      );
      return { at: new Date().toISOString(), results };
    },
  });

  const results = probe.data?.results ?? [];
  const allOk = results.length > 0 && results.every((r) => r.ok);

  return (
    <MarketingShell>
      <PageHeading
        eyebrow="Status"
        title={probe.isPending ? "Checking…" : allOk ? "All marks are burning" : "Something is quiet"}
        lede="These checks run in your browser against the live endpoints, so what you see is what your README sees. Cards keep rendering from cache even when GitHub is rate-limiting."
      />

      <div className="mt-10 divide-y divide-line rounded-lg border border-line bg-panel">
        {CHECKS.map((check) => {
          const result = results.find((r) => r.id === check.id);
          const state = probe.isPending || !result ? "checking" : result.ok ? "ok" : "down";
          const color =
            state === "ok"
              ? "var(--sg-verdigris)"
              : state === "down"
                ? "var(--sg-crimson)"
                : "var(--sg-ink-2)";
          return (
            <div
              key={check.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
                <div className="min-w-0">
                  <div className="truncate text-[14px] text-ink">{check.label}</div>
                  <div className="truncate text-[10.5px] text-ink-faint" style={mono}>
                    {check.path}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right text-[11px]" style={mono}>
                <div style={{ color }}>
                  {state === "checking" ? "checking" : state === "ok" ? "operational" : "unreachable"}
                </div>
                <div className="text-ink-faint">
                  {result ? `${result.status ?? "—"} · ${result.ms}ms` : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10.5px] text-ink-faint" style={mono}>
          {probe.data ? `last checked ${new Date(probe.data.at).toLocaleTimeString()}` : "—"}
        </p>
        <button
          onClick={() => void probe.refetch()}
          className="rounded-md border border-line px-4 py-2 text-[12.5px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          Check again
        </button>
      </div>
    </MarketingShell>
  );
}
