import { createFileRoute } from "@tanstack/react-router";
import { normalizeUsername } from "@sigil/core/profile";
import { JSON_HEADERS } from "@/lib/card-http";

export const Route = createFileRoute("/api/v1/users/$username")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const username = normalizeUsername(params["username"] ?? "");
        if (!username) {
          return Response.json(
            { error: "invalid_username" },
            { status: 400, headers: JSON_HEADERS },
          );
        }

        const { resolveProfile } = await import("@/lib/profile-store.server");
        const resolved = await resolveProfile(username);
        if (resolved.availability === "missing") {
          return Response.json(
            { error: "not_found", username },
            { status: 404, headers: JSON_HEADERS },
          );
        }

        const { profile } = resolved;
        return Response.json(
          {
            username: profile.username,
            name: profile.name,
            bio: profile.bio,
            contributions: profile.contributions,
            repos: profile.repos,
            stars: profile.stars,
            followers: profile.followers,
            rank: { percent: profile.rankPercent, basis: "sigil-estimate" },
            streak: { current: profile.streakCurrent, best: profile.streakBest },
            languages: profile.languages,
            activity: profile.activity,
            heatmap: profile.heatmap,
            achievements: profile.achievements,
            repo: profile.repo,
            availability: resolved.availability,
            fetchedAt: resolved.fetchedAt,
          },
          { headers: JSON_HEADERS },
        );
      },
    },
  },
});
