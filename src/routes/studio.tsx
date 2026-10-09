import { createFileRoute } from "@tanstack/react-router";
import { normalizeUsername } from "@sigil/core/profile";
import { BUILTIN_THEMES } from "@sigil/core/themes";

import { RouteError } from "@/components/layout/RouteError";
import { StudioWorkspace } from "@/components/sigil/StudioWorkspace";

const PACK_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/studio")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { user?: string; theme?: string; pack?: string } => {
    const out: { user?: string; theme?: string; pack?: string } = {};
    const rawUser = typeof search["user"] === "string" ? search["user"] : "";
    const rawTheme = typeof search["theme"] === "string" ? search["theme"] : "";
    const rawPack = typeof search["pack"] === "string" ? search["pack"] : "";
    const user = normalizeUsername(rawUser);
    if (user) out.user = user;
    if (BUILTIN_THEMES.some((t) => t.id === rawTheme)) out.theme = rawTheme;
    if (PACK_ID.test(rawPack)) out.pack = rawPack.toLowerCase();
    return out;
  },
  head: () => ({
    meta: [
      { title: "Studio — design your Sigil card pack" },
      {
        name: "description",
        content:
          "Design a matching pack of nine GitHub profile cards live: pick a theme, toggle cards, and copy the Markdown for your README.",
      },
      { property: "og:title", content: "Sigil Studio — design your card pack live" },
      {
        property: "og:description",
        content: "Toggle nine cards, pick a theme, copy one line of Markdown.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: RouteError,
  component: StudioPage,
});

function StudioPage() {
  const { user, theme, pack } = Route.useSearch();
  return (
    <StudioWorkspace
      {...(user ? { initialUsername: user } : {})}
      {...(theme ? { initialThemeId: theme } : {})}
      {...(pack ? { initialPackId: pack } : {})}
    />
  );
}
