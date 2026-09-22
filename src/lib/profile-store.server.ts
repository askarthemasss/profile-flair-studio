import { missingProfile, waitingProfile } from "@sigil/core/build-profile";
import type { SigilProfile } from "@sigil/core/profile";
import type { Json } from "@/integrations/supabase/types";
import { GitHubQuiet, loadGitHubProfile } from "./github-profile.server";

export type Availability = "live" | "cached" | "degraded" | "missing";

export interface ResolvedProfile {
  profile: SigilProfile;
  availability: Availability;
  fetchedAt: string;
}

interface CacheEntry {
  profile: SigilProfile;
  githubId: number | null;
  fetchedAt: string;
  freshUntil: number;
  keepUntil: number;
  missing: boolean;
}

const FRESH_MS = 6 * 60 * 60 * 1000;
const KEEP_MS = 7 * 24 * 60 * 60 * 1000;
const MISSING_MS = 60 * 1000;

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry | null>>();

/**
 * Serve a profile without ever failing the card.
 * Fresh cache is returned immediately. Stale cache is returned while a refresh runs.
 * The first request for a login waits on GitHub, then remembers the result.
 */
export async function resolveProfile(login: string): Promise<ResolvedProfile> {
  const now = Date.now();
  const hit = memory.get(login);
  if (hit && hit.freshUntil > now) return fromCache(hit, "cached");

  if (!hit) {
    const stored = await readSnapshot(login);
    if (stored) {
      remember(login, stored, false);
      if (stored.freshUntil <= now) void refresh(login);
      return fromCache(stored, "cached");
    }
  }

  if (hit && hit.keepUntil > now) {
    void refresh(login);
    return fromCache(hit, "cached");
  }

  const refreshed = await refresh(login);
  if (refreshed) {
    return {
      profile: refreshed.profile,
      availability: refreshed.missing ? "missing" : "live",
      fetchedAt: refreshed.fetchedAt,
    };
  }

  if (hit) return fromCache(hit, "degraded");
  return {
    profile: waitingProfile(login),
    availability: "degraded",
    fetchedAt: new Date().toISOString(),
  };
}

function fromCache(entry: CacheEntry, availability: Availability): ResolvedProfile {
  return {
    profile: entry.profile,
    availability: entry.missing ? "missing" : availability,
    fetchedAt: entry.fetchedAt,
  };
}

function remember(login: string, entry: CacheEntry, missing: boolean): void {
  memory.set(login, { ...entry, missing });
}

async function refresh(login: string): Promise<CacheEntry | null> {
  const pending = inflight.get(login);
  if (pending) return pending;

  const task = (async () => {
    try {
      const loaded = await loadGitHubProfile(login);
      const fetchedAt = new Date().toISOString();
      if (loaded.availability === "missing") {
        const entry: CacheEntry = {
          profile: missingProfile(login),
          githubId: null,
          fetchedAt,
          freshUntil: Date.now() + MISSING_MS,
          keepUntil: Date.now() + MISSING_MS,
          missing: true,
        };
        memory.set(login, entry);
        return entry;
      }
      const entry: CacheEntry = {
        profile: loaded.profile,
        githubId: loaded.githubId,
        fetchedAt,
        freshUntil: Date.now() + FRESH_MS,
        keepUntil: Date.now() + KEEP_MS,
        missing: false,
      };
      memory.set(login, entry);
      void writeSnapshot(login, entry);
      return entry;
    } catch (error) {
      if (!(error instanceof GitHubQuiet)) console.error(error);
      return null;
    } finally {
      inflight.delete(login);
    }
  })();

  inflight.set(login, task);
  return task;
}

function canUseSupabase(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}

async function readSnapshot(login: string): Promise<CacheEntry | null> {
  if (!canUseSupabase()) return null;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("snapshots")
      .select("data, github_id, fetched_at, next_refresh_at")
      .eq("login", login)
      .maybeSingle();
    if (error || !data) return null;
    const profile = asProfile(data.data);
    if (!profile) return null;
    const freshUntil = Date.parse(data.next_refresh_at);
    return {
      profile,
      githubId: data.github_id,
      fetchedAt: data.fetched_at,
      freshUntil: Number.isFinite(freshUntil) ? freshUntil : 0,
      keepUntil: Date.now() + KEEP_MS,
      missing: false,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function writeSnapshot(login: string, entry: CacheEntry): Promise<void> {
  if (!canUseSupabase() || entry.missing) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const data = JSON.parse(JSON.stringify(entry.profile)) as Json;
    const { error } = await supabaseAdmin.from("snapshots").upsert({
      login,
      github_id: entry.githubId,
      data,
      source: "public_pool",
      fetched_at: entry.fetchedAt,
      next_refresh_at: new Date(entry.freshUntil).toISOString(),
      last_requested_at: new Date().toISOString(),
      fail_count: 0,
    });
    if (error) console.error(error.message);
  } catch (error) {
    console.error(error);
  }
}

function asProfile(value: Json): SigilProfile | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const profile = value as unknown as SigilProfile;
  if (typeof profile.username !== "string") return null;
  if (!Array.isArray(profile.heatmap) || !Array.isArray(profile.activity)) return null;
  return profile;
}
