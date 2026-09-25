import { fetchSnapshot, type ContributionYear, type GithubSnapshot } from "@sigil/core/github";
import { computeRank } from "@sigil/core/stats/rank";
import { evaluateAchievements } from "@sigil/core/stats/achievements-defs";
import { heatmapLevels, weeklyCounts } from "@sigil/core/contributions";
import { ACTIVITY_WEEKS, HEATMAP_WEEKS, type SigilProfile } from "@sigil/core/profile";

const REFRESH_MS = 6 * 60 * 60 * 1000;

async function admin() {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Load cached years (with commit/review totals from the last snapshot), fetch, persist. */
export async function refreshSnapshot(
  login: string,
  token: string,
  source: "public_pool" | "user_token" = "public_pool",
): Promise<GithubSnapshot> {
  const key = login.toLowerCase();
  const db = await admin();
  let cached: ContributionYear[] = [];
  if (db) {
    const [{ data: rows }, { data: snap }] = await Promise.all([
      db.from("contribution_years").select("year,total,days,fetched_at").eq("login", key),
      db.from("snapshots").select("data").eq("login", key).maybeSingle(),
    ]);
    const prev = (snap?.data as GithubSnapshot | null)?.years ?? [];
    const extra = new Map(prev.map((y) => [y.year, y]));
    cached = (rows ?? []).map((r) => ({
      year: r.year,
      total: r.total,
      days: r.days ?? [],
      fetchedAt: r.fetched_at,
      ...(extra.get(r.year)?.commits !== undefined ? { commits: extra.get(r.year)!.commits! } : {}),
      ...(extra.get(r.year)?.reviews !== undefined ? { reviews: extra.get(r.year)!.reviews! } : {}),
    }));
    // A cached year without commit totals must be re-fetched.
    cached = cached.filter((y) => y.commits !== undefined);
  }

  const snapshot = await fetchSnapshot(key, token, cached);

  if (db) {
    const now = new Date();
    const fresh = snapshot.years.filter((y) => y.fetchedAt === snapshot.fetchedAt);
    await Promise.all([
      fresh.length
        ? db.from("contribution_years").upsert(
            fresh.map((y) => ({ login: key, year: y.year, total: y.total, days: y.days, fetched_at: y.fetchedAt })),
          )
        : null,
      db.from("snapshots").upsert({
        login: key,
        github_id: snapshot.githubId,
        data: snapshot as never,
        source,
        fetched_at: snapshot.fetchedAt,
        next_refresh_at: new Date(now.getTime() + REFRESH_MS).toISOString(),
        fail_count: 0,
      }),
    ]);
  }
  return snapshot;
}

/** Adapt the pipeline snapshot to the profile the cards render. */
export function profileFromSnapshot(s: GithubSnapshot, now = new Date()): SigilProfile {
  const today = now.toISOString().slice(0, 10);
  const days = s.years.flatMap((y) =>
    y.days.map((count, i) => ({
      date: new Date(Date.UTC(y.year, 0, 1 + i)).toISOString().slice(0, 10),
      count,
    })),
  ).filter((d) => d.date <= today);
  const max = Math.max(1, ...days.slice(-182).map((d) => d.count));
  const leveled = days.map((d) => ({ ...d, level: d.count === 0 ? 0 : Math.max(1, Math.ceil((4 * d.count) / max)) }));
  const rank = computeRank({
    commits: s.counts.commits,
    prsMerged: s.counts.prsMerged,
    stars: s.counts.stars,
    reviews: s.counts.reviews,
    followers: s.counts.followers,
    issues: s.counts.issues,
    contributedTo: s.counts.contributedTo,
    longestStreak: s.streak.longest,
  });
  const top = s.topRepos[0];
  return {
    username: s.login,
    name: s.name || s.login,
    bio: s.bio || "GitHub profile",
    contributions: s.counts.contributions,
    repos: s.counts.repos,
    stars: s.counts.stars,
    followers: s.counts.followers,
    rankPercent: Math.max(1, Math.round(100 - rank.score)),
    streakCurrent: s.streak.current,
    streakBest: s.streak.longest,
    languages: s.languages.slice(0, 6).map((l) => ({ name: l.name, pct: Math.round(l.pct) })),
    heatmap: heatmapLevels(leveled, today, HEATMAP_WEEKS),
    activity: weeklyCounts(leveled, today, ACTIVITY_WEEKS),
    achievements: evaluateAchievements(s).map((a) => ({ name: a.name, earned: a.tier !== null })),
    repo: {
      name: top?.name ?? `${s.login}/—`,
      description: top?.description ?? "",
      stars: top?.stars ?? 0,
      forks: top?.forks ?? 0,
      language: top?.language ?? "",
    },
    commits: s.counts.commits,
    prsMerged: s.counts.prsMerged,
    reviews: s.counts.reviews,
    issues: s.counts.issues,
    days,
    languageBytes: s.languages.map((l) => ({ name: l.name, bytes: l.bytes })),
    topRepos: s.topRepos.map((r) => ({
      name: r.name, description: r.description, stars: r.stars, forks: r.forks,
      language: r.language ?? "", pushedAt: r.pushedAt,
    })),
    asOf: s.fetchedAt,
  };
}
