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
export function useLiveProfile(login: string | null): LiveProfileState {
  const debounced = useDebounced(login, 400);
  const query = useQuery({
    queryKey: ["sigil-profile", debounced],
    enabled: Boolean(debounced),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    queryFn: () => fetchProfile(debounced as string),
  });

  if (!login) return IDLE;
  if (login !== debounced || query.isPending) {
    return { phase: "loading", profile: null, availability: null };
  }
  if (query.isError || !query.data) {
    return { phase: "error", profile: null, availability: null };
  }
  if (query.data.status === "missing") {
    return { phase: "missing", profile: null, availability: "missing" };
  }
  return { phase: "ready", profile: query.data.profile, availability: query.data.availability };
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

async function fetchProfile(
  login: string,
): Promise<
  { status: "ready"; profile: SigilProfile; availability: string } | { status: "missing" }
> {
  const response = await fetch(`/api/v1/users/${encodeURIComponent(login)}`, {
    headers: { Accept: "application/json" },
  });
  if (response.status === 404) return { status: "missing" };
  if (!response.ok) throw new Error(`profile ${response.status}`);
  const body = (await response.json()) as UserPayload;
  const profile = profileFromApi(body);
  if (!profile) throw new Error("profile shape");
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
    commits: num(body.commits),
    prsMerged: num(body.prsMerged),
    reviews: num(body.reviews),
    issues: num(body.issues),
  };
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
