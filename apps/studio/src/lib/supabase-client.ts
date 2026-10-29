import { ENV } from "./env.js";

/**
 * Lightweight Supabase REST and Auth client.
 * Uses native fetch against Supabase PostgREST & GoTrue APIs.
 */
class SupabaseClient {
  private readonly url: string;
  private readonly key: string;

  constructor(url: string, key: string) {
    this.url = url.replace(/\/$/, "");
    this.key = key;
  }

  private headers(token?: string): HeadersInit {
    return {
      apikey: this.key,
      Authorization: `Bearer ${token ?? this.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
  }

  get auth() {
    return {
      signInWithOAuth: async (provider: "github", redirectTo?: string) => {
        if (!this.url) {
          console.warn("[supabase] No VITE_SUPABASE_URL set");
          return { error: null };
        }
        const redirect = redirectTo ?? window.location.origin + "/auth/callback";
        const authUrl = `${this.url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(
          redirect,
        )}`;
        window.location.href = authUrl;
        return { error: null };
      },

      signOut: async () => {
        localStorage.removeItem("sigil-session");
        return { error: null };
      },

      getSession: () => {
        const item = localStorage.getItem("sigil-session");
        if (!item) return null;
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      },
    };
  }

  async from<T = any>(table: string) {
    const baseUrl = `${this.url}/rest/v1/${table}`;
    return {
      select: async (query = "*"): Promise<{ data: T[] | null; error: Error | null }> => {
        if (!this.url) return { data: [], error: null };
        try {
          const res = await fetch(`${baseUrl}?select=${encodeURIComponent(query)}`, {
            headers: this.headers(),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
          const data = await res.json();
          return { data, error: null };
        } catch (err) {
          return { data: null, error: err as Error };
        }
      },
      insert: async (values: Partial<T>): Promise<{ data: T | null; error: Error | null }> => {
        if (!this.url) return { data: values as T, error: null };
        try {
          const res = await fetch(baseUrl, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(values),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
          const data = await res.json();
          return { data: Array.isArray(data) ? data[0] : data, error: null };
        } catch (err) {
          return { data: null, error: err as Error };
        }
      },
    };
  }
}

export const supabase = new SupabaseClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
