import React, { useState } from "react";
import { useStudioStore } from "../../store/studio-store.js";
import { ENV } from "../../lib/env.js";
import { renderOrigin } from "../../lib/render-url.js";
import type { ExportFormat } from "../../types.js";
import { Copy, Check, Code, FileText, Globe, type LucideIcon } from "lucide-react";

export const ExportPanel: React.FC = () => {
  const { user, theme, overrides, cards, exportFormat, setExportFormat } = useStudioStore();
  const [copied, setCopied] = useState(false);

  const getCardUrl = (cardId: string, params: Record<string, string>) => {
    // Without a configured Worker this still resolves to an explicit
    // placeholder host, and the panel warns that the URLs are not live.
    const url = new URL(`${renderOrigin()}/c/${cardId}/${user}`);
    url.searchParams.set("theme", theme);
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
    Object.entries(overrides).forEach(([k, v]) => {
      if (v && typeof v === "string") url.searchParams.set(k, v.replace("#", ""));
    });
    return url.toString();
  };

  const generateOutput = (fmt: ExportFormat): string => {
    if (cards.length === 0) return "<!-- No cards configured -->";

    const profileUrl = `https://github.com/${user}`;

    switch (fmt) {
      case "markdown":
        return cards
          .map((c) => `[![${user}'s ${c.card}](${getCardUrl(c.card, c.params)})](${profileUrl})`)
          .join("\n\n");

      case "html":
        return cards
          .map(
            (c) =>
              `<a href="${profileUrl}"><img src="${getCardUrl(
                c.card,
                c.params,
              )}" alt="${user}'s ${c.card}" /></a>`,
          )
          .join("\n");

      case "url":
        return cards.map((c) => getCardUrl(c.card, c.params)).join("\n");
    }
  };

  const codeText = generateOutput(exportFormat);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const formats: { id: ExportFormat; label: string; icon: LucideIcon }[] = [
    { id: "markdown", label: "Markdown", icon: FileText },
    { id: "html", label: "HTML", icon: Code },
    { id: "url", label: "Raw URLs", icon: Globe },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
            Export Snippets
          </h3>
          <p className="text-[11px] text-ink-muted">Embed your flair into README.md or portfolio</p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md bg-ember px-3 py-1.5 text-xs font-medium text-obsidian shadow-glow transition-colors hover:bg-ember-glow"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied!" : "Copy Snippet"}</span>
        </button>
      </div>

      {/* Format Switcher */}
      <div className="flex items-center gap-1 rounded bg-raised p-1 text-xs">
        {formats.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setExportFormat(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded py-1 transition-all ${
              exportFormat === id
                ? "bg-obsidian text-ember font-medium shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Code Block */}
      <div className="relative mt-1">
        <pre className="max-h-40 overflow-x-auto rounded border border-line bg-obsidian p-3 font-mono text-[11px] leading-relaxed text-ink-muted selection:bg-ember/20">
          <code>{codeText}</code>
        </pre>
      </div>

      {!ENV.HAS_RENDER_API && (
        <p className="text-[11px] leading-relaxed text-ember-glow">
          No render API configured for this build, so these URLs point at the studio itself. Set{" "}
          <code className="text-ink">VITE_RENDER_API_URL</code> to your Worker URL before copying.
        </p>
      )}
    </div>
  );
};
