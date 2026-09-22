import { createFileRoute } from "@tanstack/react-router";
import { BUILTIN_THEMES } from "@sigil/core/themes";
import { JSON_HEADERS } from "@/lib/card-http";

export const Route = createFileRoute("/api/v1/themes")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(
          {
            themes: BUILTIN_THEMES.map((theme) => ({
              id: theme.id,
              name: theme.name,
              mode: theme.mode,
              feel: theme.feel,
              colors: {
                bg: theme.bg,
                text: theme.text,
                accent: theme.accent,
                accentGlow: theme.accentGlow,
                gold: theme.gold,
                muted: theme.muted,
                border: theme.border,
              },
            })),
          },
          { headers: JSON_HEADERS },
        );
      },
    },
  },
});
