import React from "react";
import type { ThemeCardProps } from "../../types.js";
import { Heart, Check, ArrowRight } from "lucide-react";

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, votes, voted, onVote, onApply }) => {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-line bg-panel p-4 shadow-card transition-all hover:border-line-strong hover:shadow-elevated">
      <div>
        {/* Visual Swatch Preview */}
        <div
          className="relative mb-3.5 flex h-24 w-full flex-col justify-between rounded-lg border p-3"
          style={{
            backgroundColor: theme.colors.bg,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold" style={{ color: theme.colors.text }}>
              {theme.name}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-mono uppercase"
              style={{
                backgroundColor: theme.colors.bgAlt,
                color: theme.colors.accent,
              }}
            >
              {theme.mode}
            </span>
          </div>

          {/* Color Heat Dots */}
          <div className="flex items-center gap-1.5">
            {theme.heat.map((c: string, i: number) => (
              <span
                key={i}
                className="h-3.5 w-3.5 rounded-sm border border-black/20"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Theme Details */}
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-sm font-semibold text-ink">{theme.name}</h3>
          <span className="text-[11px] font-mono text-ink-muted">by @{theme.author}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
        {/* Vote Button */}
        <button
          onClick={() => onVote(theme.id)}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            voted ? "bg-crimson/10 text-crimson" : "text-ink-muted hover:bg-raised hover:text-ink"
          }`}
          title="Vote for this theme"
        >
          <Heart className={`h-3.5 w-3.5 ${voted ? "fill-crimson" : ""}`} />
          <span>{votes}</span>
        </button>

        {/* Apply Button */}
        <button
          onClick={() => onApply(theme.id)}
          className="flex items-center gap-1 rounded-md bg-raised px-3 py-1 text-xs font-medium text-ink transition-colors hover:bg-ember hover:text-obsidian hover:font-semibold"
        >
          <span>Use Theme</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
