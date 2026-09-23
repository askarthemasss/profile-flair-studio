import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BUILTIN_THEMES } from "@sigil/core/themes";
import { CARD_KIND_IDS } from "@sigil/core/profile";
import { renderCardSvg } from "@sigil/core/render/svg";
import { contrastRatio } from "@sigil/core/color";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { MarketingShell } from "@/components/layout/MarketingShell";
import { RouteError } from "@/components/layout/RouteError";
import { DEMO_PROFILE } from "@/lib/studio-data";
import { signInWithGoogle, useSession } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const mono = { fontFamily: "var(--font-mono)" } as const;
const display = { fontFamily: "var(--font-display)" } as const;

export const Route = createFileRoute("/themes/$id")({
  loader: ({ params }) => {
    const theme = BUILTIN_THEMES.find((t) => t.id === params.id);
    if (!theme) throw notFound();
    return { theme };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.theme.name;
    if (!name) {
      return {
        meta: [{ title: "Theme unavailable — Sigil" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${name} theme — Sigil cards`;
    const description = `${loaderData.theme.feel} A ${loaderData.theme.mode} palette for all nine Sigil GitHub profile cards.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: RouteError,
  component: ThemeDetail,
});

function ThemeDetail() {
  const { theme } = Route.useLoaderData();
  const { session } = useSession();
  const queryClient = useQueryClient();

  const votes = useQuery({
    queryKey: ["theme-votes"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("theme_vote_counts");
      if (error) throw error;
      return data ?? [];
    },
  });

  const mine = useQuery({
    queryKey: ["theme-vote", theme.id, session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("theme_votes")
        .select("theme_id")
        .eq("theme_id", theme.id)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });

  const count = votes.data?.find((row) => row.theme_id === theme.id)?.votes ?? 0;

  async function toggleVote() {
    if (!session) {
      await signInWithGoogle(`/themes/${theme.id}`);
      return;
    }
    if (mine.data) {
      const { error } = await supabase
        .from("theme_votes")
        .delete()
        .eq("theme_id", theme.id)
        .eq("user_id", session.user.id);
      if (error) {
        toast.error("Could not remove your vote", { description: error.message });
        return;
      }
    } else {
      const { error } = await supabase
        .from("theme_votes")
        .insert({ theme_id: theme.id, user_id: session.user.id });
      if (error) {
        toast.error("Could not save your vote", { description: error.message });
        return;
      }
    }
    await queryClient.invalidateQueries({ queryKey: ["theme-vote", theme.id, session.user.id] });
    await queryClient.invalidateQueries({ queryKey: ["theme-votes"] });
  }

  const swatches = [
    ["bg", theme.bg],
    ["text", theme.text],
    ["accent", theme.accent],
    ["accentGlow", theme.accentGlow],
    ["gold", theme.gold],
    ["muted", theme.muted],
    ["border", theme.border],
  ] as const;

  return (
    <MarketingShell>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ember" style={mono}>
            {theme.mode} theme · {theme.id}
          </p>
          <h1 className="mt-3 text-[34px] leading-tight tracking-tight text-ink md:text-[42px]" style={display}>
            {theme.name}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">{theme.feel}</p>
        </div>
        <button
          onClick={() => void toggleVote()}
          className="flex shrink-0 items-center gap-2 rounded-md border border-line px-3 py-2 text-[12.5px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          <Heart
            className="size-4"
            style={{ color: mine.data ? "var(--sg-ember)" : undefined }}
            fill={mine.data ? "var(--sg-ember)" : "none"}
          />
          <span style={mono}>{count}</span>
        </button>
      </div>
      {!session && (
        <p className="mt-2 text-[11px] text-ink-faint" style={mono}>
          Sign in to vote for this theme.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {swatches.map(([label, value]) => (
          <div key={label} className="rounded-md border border-line bg-panel px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="size-4 rounded" style={{ background: value, outline: "1px solid var(--sg-border)" }} />
              <span className="text-[11px] text-ink" style={mono}>
                {label}
              </span>
            </div>
            <span className="mt-1 block text-[10px] text-ink-faint" style={mono}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-ink-faint" style={mono}>
        text/bg {contrastRatio(theme.text, theme.bg).toFixed(2)}:1 · accent/bg{" "}
        {contrastRatio(theme.accent, theme.bg).toFixed(2)}:1
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/studio"
          search={{ theme: theme.id }}
          className="sg-breath rounded-md bg-ember px-5 py-2.5 text-[13px] font-semibold text-obsidian"
        >
          Use in the studio
        </Link>
        <Link
          to="/themes"
          className="rounded-md border border-line px-5 py-2.5 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          All themes
        </Link>
      </div>

      <div
        className="mt-10 grid gap-4 rounded-lg p-4 sm:grid-cols-2 xl:grid-cols-3"
        style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
      >
        {CARD_KIND_IDS.map((kind) => (
          <div
            key={kind}
            className="[&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{
              __html: renderCardSvg({ kind, profile: DEMO_PROFILE, theme, animate: true }),
            }}
          />
        ))}
      </div>
    </MarketingShell>
  );
}
