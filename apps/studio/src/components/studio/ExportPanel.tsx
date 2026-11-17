import React, { useEffect, useRef, useState } from "react";
import { useStudioStore } from "../../store/studio-store.js";
import { ENV } from "../../lib/env.js";
import { renderOrigin } from "../../lib/render-url.js";
import type { ExportFormat } from "../../types.js";
import { Copy, Check, Code, FileText, Globe, TriangleAlert, type LucideIcon } from "lucide-react";

type CopyStatus = "idle" | "copied" | "failed";

export const ExportPanel: React.FC = () => {
  const { user, theme, overrides, cards, exportFormat, setExportFormat } = useStudioStore();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

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
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);

    try {
      await navigator.clipboard.writeText(codeText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    resetTimer.current = window.setTimeout(() => {
      setCopyStatus("idle");
      resetTimer.current = null;
    }, 3000);
  };

  const formats: { id: ExportFormat; label: string; icon: LucideIcon }[] = [
    { id: "markdown", label: "Markdown", icon: FileText },
    { id: "html", label: "HTML", icon: Code },
    { id: "url", label: "Raw URLs", icon: Globe },
  ];

  return (
    <div className="notebook-card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal">
            Export Snippets
          </h2>
          <p className="mt-0.5 font-display text-xs italic text-warm-grey">
            Embed your flair into README.md or a portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="notebook-btn notebook-btn--primary notebook-btn--sm"
        >
          {copyStatus === "copied" ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : copyStatus === "failed" ? (
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>
            {copyStatus === "copied"
              ? "Copied"
              : copyStatus === "failed"
                ? "Copy Failed"
                : "Copy Snippet"}
          </span>
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {copyStatus === "copied"
          ? "Snippet copied to clipboard."
          : copyStatus === "failed"
            ? "Copy failed. Select the snippet and copy it manually."
            : ""}
      </p>

      <div className="segmented w-full">
        {formats.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setExportFormat(id)}
            data-active={exportFormat === id}
            aria-pressed={exportFormat === id}
            aria-label={label}
            className="segmented__btn flex flex-1 items-center justify-center gap-1.5"
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <pre className="notebook-code max-h-40">
        <code>{codeText}</code>
      </pre>

      {copyStatus === "failed" ? (
        <p className="text-[11px] leading-relaxed text-crimson">
          Could not copy automatically. Select the snippet above and copy it manually.
        </p>
      ) : null}

      {!ENV.HAS_RENDER_API ? (
        <p className="text-[11px] leading-relaxed text-terracotta-ink">
          No render API configured for this build, so these URLs point at the studio itself. Set{" "}
          <code className="notebook-inline-code">VITE_RENDER_API_URL</code> to your Worker URL
          before copying.
        </p>
      ) : null}
    </div>
  );
};
