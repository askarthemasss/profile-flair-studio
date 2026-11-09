import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Header } from "./Header.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { SigilMark } from "./SigilMark.js";

interface AppShellProps {
  children: ReactNode;
  hideHeader?: boolean;
}

const footerLinks = [
  { name: "Studio", path: "/studio" },
  { name: "Themes", path: "/themes" },
  { name: "Docs", path: "/docs" },
  { name: "Presets", path: "/presets" },
  { name: "Status", path: "/status" },
];

export const AppShell: React.FC<AppShellProps> = ({ children, hideHeader = false }) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream text-charcoal antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-full focus:bg-charcoal focus:px-4 focus:py-2 focus:text-sm focus:text-warm-white"
      >
        Skip to content
      </a>
      <div className="grain-overlay" aria-hidden="true" />
      {!hideHeader && <Header />}
      <ErrorBoundary>
        <main id="main" className="w-full flex-1">
          {children}
        </main>
      </ErrorBoundary>

      <footer className="border-t border-[var(--card-border)] bg-sage">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-9 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <SigilMark className="h-7 w-7 text-charcoal" />
            <div>
              <p className="font-display text-sm tracking-[0.16em] text-charcoal">Sigil</p>
              <p className="font-display text-xs italic text-warm-grey">
                Flair drawn in ink, not generated.
              </p>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[10px] uppercase tracking-[0.12em] text-warm-grey"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="transition-colors hover:text-charcoal"
              >
                {link.name}
              </Link>
            ))}
            <a
              href="https://github.com/askarthemasss/profile-flair-studio"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-charcoal"
            >
              Source
            </a>
          </nav>

          <p className="font-mono text-[10px] text-warm-grey">
            © {new Date().getFullYear()} Sigil · Open source
          </p>
        </div>
      </footer>
    </div>
  );
};
