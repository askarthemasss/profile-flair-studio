import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BRAND } from "@sigil/core";
import { Github } from "lucide-react";

export const Header: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { name: "Studio", path: "/studio" },
    { name: "Themes", path: "/themes" },
    { name: "Docs", path: "/docs" },
    { name: "Presets", path: "/presets" },
    { name: "Status", path: "/status" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-obsidian/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ember text-xs font-bold text-obsidian shadow-glow">
              Σ
            </span>
            <span className="font-display text-base font-semibold tracking-wider text-ink uppercase">
              {BRAND.name}
            </span>
            <span className="hidden rounded bg-raised px-1.5 py-0.5 text-[10px] font-mono text-ink-muted sm:inline-block">
              v1.0
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active =
                location.pathname === link.path ||
                (link.path === "/studio" && location.pathname === "/");
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-raised text-ember font-semibold"
                      : "text-ink-muted hover:bg-raised/60 hover:text-ink"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right action */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/askarthemasss/profile-flair-studio"
            target="_blank"
            rel="noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink-muted transition-colors hover:border-ink hover:text-ink"
            aria-label="GitHub Repository"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
