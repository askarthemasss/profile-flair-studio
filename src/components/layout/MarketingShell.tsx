import { BRAND } from "@sigil/core/brand";
import type { ReactNode } from "react";

import { SigilMark } from "./SigilMark";
import { SiteHeader } from "./SiteHeader";

const mono = { fontFamily: "var(--font-mono)" } as const;

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-obsidian text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-10 md:py-14">{children}</main>
      <footer className="border-t border-line">
        <div
          className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-[11px] text-ink-faint"
          style={mono}
        >
          <span className="inline-flex items-center gap-2">
            <SigilMark className="size-4" />
            {BRAND.name} — {BRAND.tagline}
          </span>
          <span>{BRAND.license} · open source</span>
        </div>
      </footer>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-[10px] uppercase tracking-[0.2em] text-ember" style={mono}>
        {eyebrow}
      </p>
      <h1
        className="mt-3 text-[34px] leading-[1.1] tracking-tight text-ink md:text-[44px]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>
      {lede && <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{lede}</p>}
    </div>
  );
}
