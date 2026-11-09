import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BRAND } from "@sigil/core";
import { Github } from "lucide-react";
import { SigilMark } from "./SigilMark.js";
import { ThemeToggle } from "./ThemeToggle.js";

const navLinks = [
  { name: "Studio", path: "/studio" },
  { name: "Themes", path: "/themes" },
  { name: "Docs", path: "/docs" },
  { name: "Presets", path: "/presets" },
  { name: "Status", path: "/status" },
];

const navLinkClass = (active: boolean) =>
  `relative whitespace-nowrap rounded-full px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.14em] transition-colors ${
    active ? "text-terracotta-ink" : "text-warm-grey hover:text-charcoal"
  }`;

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || (path === "/studio" && location.pathname === "/");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--card-border)] bg-[var(--badge-bg)] backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-5">
          <Link to="/" className="group flex items-center gap-2.5">
            <SigilMark className="h-7 w-7 shrink-0 text-charcoal transition-transform duration-300 group-hover:-rotate-3" />
            <span className="font-display text-lg tracking-[0.18em] text-charcoal">
              {BRAND.name}
            </span>
            <span className="notebook-chip notebook-chip--status hidden px-2 py-0.5 text-[9px] text-warm-grey sm:inline-flex">
              v1.0
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link key={link.path} to={link.path} className={navLinkClass(active)}>
                  {link.name}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-gold/60"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com/askarthemasss/profile-flair-studio"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)] text-warm-grey transition-colors hover:border-[var(--card-border-hover)] hover:text-charcoal"
            aria-label="GitHub repository"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>

      <nav
        aria-label="Primary mobile"
        className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6 md:hidden"
      >
        {navLinks.map((link) => {
          const active = isActive(link.path);
          return (
            <Link key={link.path} to={link.path} className={navLinkClass(active)}>
              {link.name}
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-0.5 h-px bg-gold/60"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
