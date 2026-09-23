import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RouteError } from "@/components/layout/RouteError";
import { supabase } from "@/integrations/supabase/client";
import { takeIntendedPath } from "@/lib/auth";

const mono = { fontFamily: "var(--font-mono)" } as const;

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — Sigil" },
      { name: "description", content: "Completing your Sigil sign-in." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Signing you in — Sigil" },
      { property: "og:description", content: "Completing your Sigil sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: RouteError,
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let done = false;

    async function finish() {
      const { data } = await supabase.auth.getSession();
      if (done) return;
      const intended = takeIntendedPath();
      if (data.session) {
        done = true;
        navigate({ to: intended ?? "/dashboard", replace: true });
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void finish();
    });
    void finish();

    const timer = setTimeout(() => {
      if (!done) navigate({ to: "/", replace: true });
    }, 6000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-obsidian text-ink">
      <div className="text-center">
        <span className="sg-breath inline-block size-2 rounded-full bg-ember" />
        <p className="mt-4 text-[12px] text-ink-muted" style={mono}>
          finishing sign-in…
        </p>
      </div>
    </div>
  );
}
