import { BRAND } from "@sigil/core/brand";
import { sigilMarkdown } from "@sigil/core/markdown";
import { Copy, Save } from "lucide-react";
import { toast } from "sonner";

import type { CardKind } from "@/lib/studio-data";

const mono = { fontFamily: "var(--font-mono)" } as const;

export function ExportPanel({
  username,
  kinds,
  themeId,
  animate,
  staticBackup,
  packName,
  isPublic,
  saving,
  sessionLoading,
  signedIn,
  editing,
  onPackName,
  onPublic,
  onSave,
}: {
  username: string;
  kinds: CardKind[];
  themeId: string;
  animate: boolean;
  staticBackup: boolean;
  packName: string;
  isPublic: boolean;
  saving: boolean;
  sessionLoading: boolean;
  signedIn: boolean;
  editing: boolean;
  onPackName: (name: string) => void;
  onPublic: (value: boolean) => void;
  onSave: () => void;
}) {
  const markdown = sigilMarkdown({ username, kinds, themeId, animate, staticBackup });

  function copy() {
    void navigator.clipboard?.writeText(markdown);
    toast.success("Markdown copied", {
      description: `${kinds.length} card snippet${kinds.length === 1 ? "" : "s"} ready to paste into your profile README.`,
    });
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-lg border border-line bg-panel p-4 shadow-card">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
          Export
        </h2>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-faint" style={mono}>
          @{username} · {themeId} · {animate ? "animated" : "still"} · {kinds.length} card
          {kinds.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={copy}
          disabled={kinds.length === 0}
          className="sg-breath mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-ember px-4 py-2.5 text-[13px] font-semibold text-obsidian transition-transform hover:scale-[1.01] disabled:opacity-40"
        >
          <Copy className="size-4" /> Copy Markdown
        </button>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4 shadow-card">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
          Save pack
        </h2>
        <label className="mt-3 block text-[11px] text-ink-muted">
          Name
          <input
            value={packName}
            onChange={(event) => onPackName(event.target.value)}
            maxLength={60}
            className="mt-1 w-full rounded-md border border-line bg-raised px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
            style={mono}
            spellCheck={false}
          />
        </label>
        <button
          onClick={() => onPublic(!isPublic)}
          className="mt-3 flex w-full items-center justify-between text-left"
        >
          <span>
            <span className="block text-[13px] text-ink">Public link</span>
            <span className="text-[10px] text-ink-faint">
              anyone with the pack link can open it
            </span>
          </span>
          <span
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{ background: isPublic ? "var(--sg-ember)" : "var(--sg-bg-3)" }}
          >
            <span
              className="absolute top-0.5 size-4 rounded-full bg-obsidian transition-all"
              style={{ left: isPublic ? "calc(100% - 18px)" : "2px" }}
            />
          </span>
        </button>
        <button
          onClick={onSave}
          disabled={saving || sessionLoading || packName.trim().length === 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-line px-4 py-2.5 text-[13px] text-ink transition-colors hover:border-line-strong disabled:opacity-40"
        >
          <Save className="size-4" />
          {saving
            ? "Saving…"
            : signedIn
              ? editing
                ? "Update pack"
                : "Save pack"
              : "Sign in to save"}
        </button>
      </div>

      <div className="min-h-0 flex-1 rounded-lg border border-line bg-panel p-4 shadow-card">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
          Snippet
        </h3>
        <pre
          className="mt-3 max-h-[320px] overflow-auto whitespace-pre-wrap break-all rounded-md border border-line bg-raised p-3 text-[10.5px] leading-relaxed text-ink-muted"
          style={mono}
        >
          {markdown || "Enable at least one card."}
        </pre>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4 shadow-card">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
          Independence
        </h3>
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
          {staticBackup
            ? "The Sigil Action commits still copies of these cards into your own repository, so the profile survives even if this service goes dark."
            : "Static backups are off. Your README will depend on live image URLs only."}
        </p>
        <p className="mt-3 text-[10px] text-ink-faint" style={mono}>
          {BRAND.license} · stale data served instantly, refreshed in background
        </p>
      </div>
    </div>
  );
}
