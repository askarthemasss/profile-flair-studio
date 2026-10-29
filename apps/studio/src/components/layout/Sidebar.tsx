import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Layers,
  Palette,
  FileText,
  LayoutDashboard,
  Activity,
  Github,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const links = [
    { name: "Pack Studio", path: "/studio", icon: Layers },
    { name: "Theme Gallery", path: "/themes", icon: Palette },
    { name: "Documentation", path: "/docs", icon: FileText },
    { name: "Account Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Render Status", path: "/status", icon: Activity },
  ];

  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-line bg-panel p-4 md:block">
      <div className="space-y-1">
        {links.map((link) => {
          const active =
            location.pathname === link.path ||
            (link.path === "/studio" && location.pathname === "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                active
                  ? "bg-raised text-ember font-semibold shadow-sm"
                  : "text-ink-muted hover:bg-raised/50 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 border-t border-line pt-4">
        <p className="px-3 text-[10px] font-mono tracking-wider text-ink-faint uppercase">
          Sigil Ecosystem
        </p>
        <div className="mt-2 space-y-1">
          <a
            href="https://github.com/marketplace/actions/sigil-flair"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] text-ink-muted transition-colors hover:text-ink"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub Action</span>
          </a>
          <a
            href="https://github.com/askarthemasss/profile-flair-studio/blob/main/themes/README.md"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] text-ink-muted transition-colors hover:text-ink"
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Submit Theme (PR)</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
