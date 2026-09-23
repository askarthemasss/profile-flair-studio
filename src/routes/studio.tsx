import { createFileRoute } from "@tanstack/react-router";
import { normalizeUsername } from "@sigil/core/profile";
import { BUILTIN_THEMES } from "@sigil/core/themes";

import { RouteError } from "@/components/layout/RouteError";
import { StudioWorkspace } from "@/components/sigil/StudioWorkspace";

export const Route = createFileRoute("/studio")({
  validateSearch: (search: Record<string, unknown>) => {
    const rawUser = typeof search["user"] === "string" ? search["user"] : "";
    const rawTheme = typeof search["theme"] === "string" ? search["theme"] : "";
    const user = normalizeUsername(rawUser);
    const theme = BUILTIN_THEMES.some((t) => t.id === rawTheme) ? rawTheme : undefined;
    return { user: user ?? undefined, theme };
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
  const { user, theme } = Route.useSearch();
  return <StudioWorkspace initialUsername={user} initialThemeId={theme} />;
}
