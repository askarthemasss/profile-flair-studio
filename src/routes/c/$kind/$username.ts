import { createFileRoute } from "@tanstack/react-router";
import { getTheme } from "@sigil/core/themes";
import { isCardKind, normalizeUsername } from "@sigil/core/profile";
import { renderCardSvg } from "@sigil/core/render/svg";
import { noticeSvg, svgResponse } from "@/lib/card-http";

export const Route = createFileRoute("/c/$kind/$username")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const kind = params["kind"] ?? "";
        const username = normalizeUsername(params["username"] ?? "");
        if (!isCardKind(kind)) {
          return svgResponse(noticeSvg("Unknown card"), 404);
        }
        if (!username) {
          return svgResponse(noticeSvg("That username is not a GitHub login"), 400);
        }

        const url = new URL(request.url);
        const theme = getTheme(url.searchParams.get("theme") ?? "");
        const animate = url.searchParams.get("animate") !== "0";

        const { resolveProfile } = await import("@/lib/profile-store.server");
        const resolved = await resolveProfile(username);
        const svg = renderCardSvg({
          kind,
          profile: resolved.profile,
          theme,
          animate,
        });
        return svgResponse(svg, 200, { "x-sigil-availability": resolved.availability });
      },
    },
  },
});
