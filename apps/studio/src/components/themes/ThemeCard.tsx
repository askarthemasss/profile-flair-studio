import React from "react";
import type { ThemeCardProps } from "../../types.js";
import { Check, ArrowRight } from "lucide-react";

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, onApply }) => {
  return (
    <div className="notebook-card flex flex-col gap-4 p-4">
      <div>
        {/* Visual swatch preview: product content, so its colors stay independent. */}
        <div
          className="relative mb-3.5 flex h-24 w-full flex-col justify-between rounded-md border p-3"
          style={{
            backgroundColor: theme.colors.bg,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-semibold" style={{ color: theme.colors.text }}>
              {theme.name}
            </span>
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase"
              style={{
                backgroundColor: theme.colors.bgAlt,
                color: theme.colors.accent,
              }}
            >
              {theme.mode}
            </span>
          </div>

          <div className="flex items-center gap-1.5" aria-hidden="true">
            {theme.heat.map((c: string, i: number) => (
              <span
                key={i}
                className="h-3.5 w-3.5 rounded-sm border border-black/20"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-base font-normal tracking-[0.02em] text-charcoal">
            {theme.name}
          </h3>
          <span className="shrink-0 font-mono text-[10px] text-warm-grey">by @{theme.author}</span>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-line pt-3">
        <button
          type="button"
          onClick={() => onApply(theme.id)}
          aria-label={`Use the ${theme.name} theme`}
          className="notebook-btn notebook-btn--secondary notebook-btn--sm"
        >
          <Check className="h-3 w-3" aria-hidden="true" />
          <span>Use Theme</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
