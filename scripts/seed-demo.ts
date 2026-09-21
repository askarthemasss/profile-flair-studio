/**
 * seed:demo — fetch the public GitHub snapshot for "octocat" and upsert it
 * into public.snapshots for local development.
 *
 * Requires env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: bun run seed:demo
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add them to .env or export them before running seed:demo.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const LOGIN = "octocat";

interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  description: string | null;
}

async function fetchJSON(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  return res.json();
}

function computeLanguages(repos: GitHubRepo[]) {
  const counts: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) counts[repo.language] = (counts[repo.language] ?? 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([language, count]) => ({
      language,
      count,
      pct: Math.round((count / total) * 1000) / 10,
    }));
}

async function main() {
  console.log(`Fetching GitHub data for "${LOGIN}"…`);
  const [user, repos] = (await Promise.all([
    fetchJSON(`https://api.github.com/users/${LOGIN}`),
    fetchJSON(`https://api.github.com/users/${LOGIN}/repos?per_page=100&sort=updated`),
  ])) as [GitHubUser, GitHubRepo[]];

  const data = {
    login: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
    bio: user.bio,
    followers: user.followers,
    following: user.following,
    public_repos: user.public_repos,
    public_gists: user.public_gists,
    created_at: user.created_at,
    languages: computeLanguages(repos),
    top_repos: repos.slice(0, 5).map((r) => ({
      name: r.name,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      description: r.description,
    })),
  };

  const now = new Date();
  const { error } = await supabase.from("snapshots").upsert(
    {
      login: LOGIN.toLowerCase(),
      github_id: user.id,
      data,
      source: "public_pool",
      fetched_at: now.toISOString(),
      next_refresh_at: new Date(now.getTime() + 3_600_000).toISOString(),
      last_requested_at: now.toISOString(),
      fail_count: 0,
    },
    { onConflict: "login" },
  );

  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded snapshot for "${LOGIN}" into public.snapshots.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
