import { Link, useRouter } from "@tanstack/react-router";

const mono = { fontFamily: "var(--font-mono)" } as const;

/** Per-page fallback in the Obsidian Ledger voice. */
export function RouteError({ error, reset }: { error: Error; reset?: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-obsidian px-5 text-ink">
      <div className="max-w-md rounded-lg border border-line bg-panel p-8 shadow-card">
        <p className="text-[10px] uppercase tracking-[0.2em] text-ember" style={mono}>
          Page did not load
        </p>
        <h2
          className="mt-3 text-[26px] leading-tight tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The ledger skipped a line
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
          Nothing was lost. Try this page again, or head back to the studio.
        </p>
        <p className="mt-3 break-words text-[10px] text-ink-faint" style={mono}>
          {error.message}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset?.();
            }}
            className="rounded-md bg-ember px-4 py-2 text-[13px] font-semibold text-obsidian"
          >
            Try again
          </button>
          <Link
            to="/studio"
            className="rounded-md border border-line px-4 py-2 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Open the studio
          </Link>
        </div>
      </div>
    </div>
  );
}
