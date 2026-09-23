import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

const INTENT_KEY = "sigil:intended-path";

const lovableAuth = createLovableAuth();

export interface SigilSession {
  session: Session | null;
  loading: boolean;
}

/** Live session state, kept fresh by Supabase's auth listener. */
export function useSession(): SigilSession {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    void supabase.auth.getSession().then(({ data: current }) => {
      setSession(current.session);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

export function rememberIntendedPath(path: string) {
  try {
    if (path.startsWith("/")) sessionStorage.setItem(INTENT_KEY, path);
  } catch {
    /* private mode */
  }
}

export function takeIntendedPath(): string | null {
  try {
    const path = sessionStorage.getItem(INTENT_KEY);
    sessionStorage.removeItem(INTENT_KEY);
    return path && path.startsWith("/") ? path : null;
  } catch {
    return null;
  }
}

/** Starts managed Google OAuth and returns true once a session exists. */
export async function signInWithGoogle(intendedPath?: string): Promise<boolean> {
  if (intendedPath) rememberIntendedPath(intendedPath);

  const result = await lovableAuth.signInWithOAuth("google", {
    redirect_uri: `${window.location.origin}/auth/callback`,
  });

  if (result.error) {
    toast.error("Sign-in didn't complete", { description: result.error.message });
    return false;
  }
  if (result.redirected) return false;

  const { error } = await supabase.auth.setSession({
    access_token: result.tokens.access_token,
    refresh_token: result.tokens.refresh_token,
  });
  if (error) {
    toast.error("Sign-in didn't complete", { description: error.message });
    return false;
  }
  return true;
}

export function displayName(session: Session | null): string {
  const meta = session?.user.user_metadata ?? {};
  return (
    (meta["full_name"] as string) ||
    (meta["name"] as string) ||
    session?.user.email ||
    "Signed in"
  );
}

export function avatarUrl(session: Session | null): string | null {
  const meta = session?.user.user_metadata ?? {};
  return (meta["avatar_url"] as string) || (meta["picture"] as string) || null;
}
