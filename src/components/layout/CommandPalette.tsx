import { useNavigate } from "@tanstack/react-router";
import { BUILTIN_THEMES } from "@sigil/core/themes";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CARD_KINDS } from "@/lib/studio-data";

const PAGES = [
  { to: "/", label: "Landing" },
  { to: "/studio", label: "Studio" },
  { to: "/themes", label: "Themes" },
  { to: "/docs", label: "Docs" },
  { to: "/status", label: "Status" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

/** Ctrl/Cmd+K — jump to a page, a theme, or a card type. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a page, theme, or card…" />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGES.map((page) => (
            <CommandItem
              key={page.to}
              value={`page ${page.label}`}
              onSelect={() => go(() => navigate({ to: page.to }))}
            >
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Cards">
          {CARD_KINDS.map((card) => (
            <CommandItem
              key={card.id}
              value={`card ${card.name} ${card.id}`}
              onSelect={() =>
                go(() => navigate({ to: "/docs/$card", params: { card: card.id } }))
              }
            >
              {card.name}
              <span
                className="ml-auto text-[10px] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {card.id}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Themes">
          {BUILTIN_THEMES.map((theme) => (
            <CommandItem
              key={theme.id}
              value={`theme ${theme.name} ${theme.id}`}
              onSelect={() => go(() => navigate({ to: "/themes/$id", params: { id: theme.id } }))}
            >
              <span className="size-3 rounded-full" style={{ background: theme.accent }} />
              {theme.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
