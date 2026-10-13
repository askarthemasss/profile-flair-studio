import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BRAND } from "@sigil/core/brand";
import { Menu, LogOut, LayoutDashboard, Command } from "lucide-react";
import { useState } from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { avatarUrl, displayName, signInWithGoogle, useSession } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/studio", label: "Studio" },
  { to: "/themes", label: "Themes" },
  { to: "/docs", label: "Docs" },
  { to: "/status", label: "Status" },
] as const;

const mono = { fontFamily: "var(--font-mono)" } as const;
const display = { fontFamily: "var(--font-display)" } as const;

export function SiteHeader({ wide = false }: { wide?: boolean }) {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignIn() {
    const signedIn = await signInWithGoogle(pathname);
    if (signedIn) navigate({ to: "/dashboard" });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-line bg-obsidian">
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:gap-4 md:px-5",
          wide ? "w-full" : "mx-auto max-w-[1120px]",
        )}
      >
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="text-[19px] leading-none tracking-tight text-ink" style={display}>
            {BRAND.name}
          </span>
          <span className="size-1.5 shrink-0 rounded-full bg-ember" />
        </Link>

        <nav className="hidden items-center justify-center gap-7 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="sg-focus flex items-center gap-2 rounded-md border border-line px-2 py-1.5 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink">
                {avatarUrl(session) ? (
                  <img
                    src={avatarUrl(session)!}
                    alt=""
                    className="size-6 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-raised text-[11px] text-ember">
                    {displayName(session).charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-[120px] truncate sm:block">
                  {displayName(session)}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate text-[11px]" style={mono}>
                  {session.user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  <LayoutDashboard className="size-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleSignOut()}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={() => void handleSignIn()}
              aria-label="Sign in with Google"
              className="sg-focus whitespace-nowrap rounded-md border border-line px-3 py-2 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <span className="sm:hidden">Sign in</span>
              <span className="hidden sm:inline">Sign in with Google</span>
            </button>
          )}

          <span
            className="hidden items-center gap-1 rounded-md border border-line px-2 py-1.5 text-[10px] text-ink-faint lg:flex"
            style={mono}
          >
            <Command className="size-3" />K
          </span>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="sg-focus rounded-md border border-line p-2 text-ink-muted md:hidden"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-line bg-panel">
              <div className="mt-8 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-[15px] text-ink-muted transition-colors hover:bg-hover-surface hover:text-ink"
                    activeProps={{ className: "text-ember" }}
                  >
                    {item.label}
                  </Link>
                ))}
                {session && (
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-[15px] text-ink-muted transition-colors hover:bg-hover-surface hover:text-ink"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
              <p className="mt-6 px-3 text-[11px] text-ink-faint" style={mono}>
                {BRAND.license} · open source
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "relative py-1 text-[14px] text-ink-muted transition-colors hover:text-ink",
      )}
      activeProps={{
        className:
          "text-ink after:absolute after:inset-x-0 after:-bottom-[13px] after:h-0.5 after:bg-ember",
      }}
    >
      {label}
    </Link>
  );
}
