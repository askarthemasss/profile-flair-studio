import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { RouteError } from "@/components/layout/RouteError";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { avatarUrl, displayName, useSession } from "@/lib/auth";

const mono = { fontFamily: "var(--font-mono)" } as const;
const display = { fontFamily: "var(--font-display)" } as const;

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — your Sigil packs" },
      {
        name: "description",
        content: "Your saved Sigil card packs, connected account, and account controls.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — your Sigil packs" },
      { property: "og:description", content: "Saved packs and account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: RouteError,
  component: Dashboard,
});

function Dashboard() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const presets = useQuery({
    queryKey: ["presets", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_presets")
        .select("id, name, params, is_public, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function removePreset(id: string) {
    const { error } = await supabase.from("card_presets").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete that pack", { description: error.message });
      return;
    }
    toast.success("Pack deleted");
    await queryClient.invalidateQueries({ queryKey: ["presets", session?.user.id] });
  }

  async function signOutEverywhere() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-obsidian text-ink">
      <SiteHeader />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1120px] px-5 py-10">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {avatarUrl(session) ? (
                <img src={avatarUrl(session)!} alt="" className="size-11 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-raised text-ember" style={display}>
                  {displayName(session).charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-[24px] tracking-tight text-ink" style={display}>
                  {displayName(session)}
                </h1>
                <p className="truncate text-[11px] text-ink-faint" style={mono}>
                  {session?.user.email}
                </p>
              </div>
            </div>
            <Link
              to="/studio"
              className="shrink-0 rounded-md bg-ember px-4 py-2 text-[13px] font-semibold text-obsidian"
            >
              New pack
            </Link>
          </header>

          <section className="mt-10">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
              Saved packs
            </h2>
            {presets.isPending ? (
              <p className="mt-3 text-[12px] text-ink-faint" style={mono}>
                loading…
              </p>
            ) : presets.data && presets.data.length > 0 ? (
              <div className="mt-3 divide-y divide-line rounded-lg border border-line bg-panel">
                {presets.data.map((preset) => {
                  const params = (preset.params ?? {}) as { theme?: string; cards?: unknown[] };
                  return (
                    <div
                      key={preset.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[15px] text-ink" style={display}>
                          {preset.name}
                        </div>
                        <div className="truncate text-[10.5px] text-ink-faint" style={mono}>
                          {params.theme ?? "obsidian"} ·{" "}
                          {Array.isArray(params.cards) ? params.cards.length : 0} cards ·{" "}
                          {preset.is_public ? "public" : "private"}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          to="/studio"
                          search={params.theme ? { theme: params.theme } : {}}
                          className="rounded-md border border-line px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                        >
                          Open
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger className="rounded-md border border-line p-2 text-ink-faint transition-colors hover:text-crimson">
                            <Trash2 className="size-3.5" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete “{preset.name}”?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This removes the saved pack. Cards already pasted into your README
                                keep working.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep it</AlertDialogCancel>
                              <AlertDialogAction onClick={() => void removePreset(preset.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-ink-muted">
                No packs yet. Design one in the studio and it will appear here.
              </p>
            )}
          </section>

          <section className="mt-10 rounded-lg border border-line bg-panel p-5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={mono}>
              Connection
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Signed in with Google. Sigil reads only public GitHub data for your cards — no
              repository access is requested.
            </p>
          </section>

          <section className="mt-6 rounded-lg border p-5" style={{ borderColor: "var(--sg-crimson)" }}>
            <h2 className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--sg-crimson)", ...mono }}>
              Danger zone
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Signing out clears every cached pack in this browser.
            </p>
            <AlertDialog>
              <AlertDialogTrigger className="mt-4 rounded-md border border-line px-4 py-2 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink">
                Sign out
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out of Sigil?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You can sign back in with Google at any time. Your saved packs stay put.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void signOutEverywhere()}>
                    Sign out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </div>
      </main>
    </div>
  );
}
