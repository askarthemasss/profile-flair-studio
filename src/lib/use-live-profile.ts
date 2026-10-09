import type { SigilProfile } from "@sigil/core/profile";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export type LivePhase = "idle" | "loading" | "ready" | "missing" | "error";

export interface LiveProfileState {
  phase: LivePhase;
  profile: SigilProfile | null;
  availability: string | null;
}

const IDLE: LiveProfileState = { phase: "idle", profile: null, availability: null };

export function liveProfileNote(phase: LivePhase): { note: string; warn: boolean } {
  switch (phase) {
    case "loading":
      return { note: "Loading public GitHub data…", warn: false };
    case "ready":
      return { note: "Live stats from this GitHub login.", warn: false };
    case "missing":
      return { note: "No public GitHub profile under that login.", warn: true };
    case "error":
      return { note: "GitHub did not answer. Try that login again in a moment.", warn: true };
    default:
      return { note: "Sample pack. Enter a GitHub login to load live stats.", warn: false };
  }
}

/**
 * Load the public profile for a GitHub login.
 * Pass null to stay idle (empty field, invalid login, or the built-in sample).
 */
export interface ProfileQuery {
  isPending: boolean;
  isError: boolean;
  data: ProfileQueryData | undefined;
}

export type ProfileQueryData =
  { status: "ready"; profile: SigilProfile; availability: string } | { status: "missing" };

export function useLiveProfile(login: string | null): LiveProfileState {
  const debounced = useDebounced(login, 400);
  const query = useQuery({
    queryKey: ["sigil-profile", debounced],
    enabled: Boolean(debounced),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    queryFn: () => fetchProfile(debounced as string),
  });

  return resolveLiveState(login, debounced, query);
}

/**
 * A failed refetch keeps the last successful payload in `data`. Prefer that
 * over the error flag so a blip does not blank cards that already loaded.
 * A login that has not settled yet stays on the loading state, so the previous
 * person's stats are not shown under the new name.
 */
export function resolveLiveState(
  login: string | null,
  debounced: string | null,
  query: ProfileQuery,
): LiveProfileState {
  if (!login) return IDLE;
  if (login !== debounced || (query.isPending && !query.data)) {
    return { phase: "loading", profile: null, availability: null };
  }
  if (query.data?.status === "ready") {
    return { phase: "ready", profile: query.data.profile, availability: query.data.availability };
  }
  if (query.data?.status === "missing") {
    return { phase: "missing", profile: null, availability: "missing" };
  }
  return { phase: "error", profile: null, availability: null };
}

function useDebounced(value: string | null, ms: number): string | null {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

interface UserPayload {
  username: string;
  name: string;
  bio: string;
  contributions: number;
  repos: number;
  stars: number;
  followers: number;
  rank?: { percent?: number };
  streak?: { current?: number; best?: number };
  languages?: { name?: string; pct?: number }[];
  activity?: number[];
  heatmap?: number[];
  achievements?: { name?: string; earned?: boolean }[];
  repo?: {
    name?: string;
    description?: string;
    stars?: number;
    forks?: number;
    language?: string;
  };
  days?: { date?: string; count?: number }[];
  languageBytes?: { name?: string; bytes?: number }[];
  topRepos?: {
    name?: string;
    description?: string;
    stars?: number;
    forks?: number;
    language?: string;
    pushedAt?: string | null;
  }[];
  commits?: number;
  prsMerged?: number;
  reviews?: number;
  issues?: number;
  asOf?: string;
  avatarDataUri?: string;
  availability?: string;
}

async function fetchProfile(login: string): Promise<ProfileQueryData> {
  const response = await fetch(`/api/v1/users/${encodeURIComponent(login)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 404) return { status: "missing" };
  if (!response.ok) throw new Error(`profile ${response.status}`);
  const body = (await response.json()) as UserPayload;
  const profile = profileFromApi(body);
  if (!profile) throw new Error("profile shape");
  // A cold miss during an outage is a 200 with an empty waiting profile.
  // Throwing keeps that placeholder out of the ready state, and leaves a
  // previously loaded profile in the query cache when a later refresh fails.
  if (body.availability === "degraded") throw new Error("profile degraded");
  return { status: "ready", profile, availability: body.availability ?? "live" };
}

export function profileFromApi(body: UserPayload): SigilProfile | null {
  if (typeof body.username !== "string" || typeof body.name !== "string") return null;
  const profile: SigilProfile = {
    username: body.username,
    name: body.name,
    bio: typeof body.bio === "string" ? body.bio : "",
    contributions: num(body.contributions),
    repos: num(body.repos),
    stars: num(body.stars),
    followers: num(body.followers),
    rankPercent: num(body.rank?.percent),
    streakCurrent: num(body.streak?.current),
    streakBest: num(body.streak?.best),
    languages: (body.languages ?? [])
      .filter((row) => typeof row.name === "string")
      .map((row) => ({ name: row.name as string, pct: num(row.pct) })),
    heatmap: nums(body.heatmap),
    activity: nums(body.activity),
    achievements: (body.achievements ?? [])
      .filter((row) => typeof row.name === "string")
      .map((row) => ({ name: row.name as string, earned: Boolean(row.earned) })),
    repo: {
      name: body.repo?.name || body.username,
      description: body.repo?.description || "",
      stars: num(body.repo?.stars),
      forks: num(body.repo?.forks),
      language: body.repo?.language || "—",
    },
  };
  if (typeof body.commits === "number") profile.commits = body.commits;
  if (typeof body.prsMerged === "number") profile.prsMerged = body.prsMerged;
  if (typeof body.reviews === "number") profile.reviews = body.reviews;
  if (typeof body.issues === "number") profile.issues = body.issues;
  const days = (body.days ?? [])
    .filter((day) => typeof day.date === "string")
    .map((day) => ({ date: day.date as string, count: num(day.count) }));
  if (days.length > 0) profile.days = days;
  const languageBytes = (body.languageBytes ?? [])
    .filter((row) => typeof row.name === "string")
    .map((row) => ({ name: row.name as string, bytes: num(row.bytes) }));
  if (languageBytes.length > 0) profile.languageBytes = languageBytes;
  const topRepos = (body.topRepos ?? [])
    .filter((row) => typeof row.name === "string")
    .map((row) => ({
      name: row.name as string,
      description: row.description || "",
      stars: num(row.stars),
      forks: num(row.forks),
      language: row.language || "—",
      pushedAt: row.pushedAt ?? null,
    }));
  if (topRepos.length > 0) profile.topRepos = topRepos;
  if (typeof body.asOf === "string") profile.asOf = body.asOf;
  if (typeof body.avatarDataUri === "string" && body.avatarDataUri.startsWith("data:image/")) {
    profile.avatarDataUri = body.avatarDataUri;
  }
  return profile;
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function nums(value: unknown): number[] {
  return Array.isArray(value) ? value.map(num) : [];
}
