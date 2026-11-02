/**
 * Sigil GitHub Action — static SVG backup.
 *
 * Uses the user's own GitHub token (no Sigil server dependency) to fetch
 * stats via GraphQL and write static SVG copies of the requested cards.
 *
 * Inputs are read from environment variables set by the Actions runner.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  CARD_IDS,
  CARD_PARAM_SCHEMAS,
  CARD_RENDERERS,
  CONTRIBUTION_YEARS_QUERY,
  STATS_QUERY,
  TOP_REPOS_QUERY,
  YEAR_CONTRIBUTIONS_QUERY,
  CardIdSchema,
  buildContributionYear,
  normalizeStatsResponse,
  resolveTheme,
  selectContributionYears,
  type CardId,
  type ContributionYear,
  type GithubSnapshot,
  type RawStatsResponse,
  type RawYearResponse,
  type RawYearsResponse,
  type RepoStat,
} from "@sigil/core";

// ---------------------------------------------------------------------------
// Read Action inputs
// ---------------------------------------------------------------------------

function getInput(name: string, required = true): string {
  const env = process.env[`INPUT_${name.toUpperCase().replace(/-/g, "_")}`];
  if (required && !env) {
    console.error(`::error::Missing required input: ${name}`);
    process.exit(1);
  }
  return env ?? "";
}

const token = getInput("github-token");
const username = getInput("username");
const theme = getInput("theme") || "obsidian";
const outputDir = getInput("output-dir") || ".sigil";
const cardsInput = getInput("cards") || CARD_IDS.join(",");

const requestedKinds = cardsInput
  .split(",")
  .map((s) => s.trim())
  .filter((s) => {
    const parsed = CardIdSchema.safeParse(s);
    if (!parsed.success) console.warn(`::warning::Unknown card kind "${s}", skipping`);
    return parsed.success;
  }) as CardId[];

// ---------------------------------------------------------------------------
// GitHub GraphQL helper
// ---------------------------------------------------------------------------

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "sigil-action/0.1.0",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { data: T; errors?: unknown[] };
  if (json.errors?.length) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}

/** Inclusive date range GitHub's contributionsCollection expects. */
function yearRange(year: number): { from: string; to: string } {
  return {
    from: `${year}-01-01T00:00:00Z`,
    to: `${year}-12-31T23:59:59Z`,
  };
}

async function fetchAvatarDataUri(avatarUrl: string): Promise<string | null> {
  try {
    const res = await fetch(avatarUrl);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    return `data:${contentType};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetch + normalize the snapshot
// ---------------------------------------------------------------------------

async function fetchSnapshot(): Promise<GithubSnapshot> {
  const now = new Date();

  const [stats, repos, yearList] = await Promise.all([
    gql<RawStatsResponse>(STATS_QUERY, { login: username, includePrs: true }),
    gql<{ user: { repositories: { nodes: any[] } } | null }>(TOP_REPOS_QUERY, { login: username }),
    gql<RawYearsResponse>(CONTRIBUTION_YEARS_QUERY, { login: username }),
  ]);

  if (!stats?.user) throw new Error(`GitHub user not found: ${username}`);

  const yearsToFetch = selectContributionYears(
    yearList.user?.contributionsCollection.contributionYears ?? [],
    now,
  );
  const yearResults = await Promise.all(
    yearsToFetch.map((year) =>
      gql<RawYearResponse>(YEAR_CONTRIBUTIONS_QUERY, { login: username, ...yearRange(year) }).catch(
        (err) => {
          console.warn(`::warning::Could not fetch ${year} contributions: ${String(err)}`);
          return null;
        },
      ),
    ),
  );

  const years: ContributionYear[] = [];
  yearResults.forEach((result, i) => {
    const calendar = result?.user?.contributionsCollection.contributionCalendar;
    if (!calendar) return;
    const contributionYear = buildContributionYear(yearsToFetch[i]!, calendar, now);
    if (contributionYear) years.push(contributionYear);
  });

  const topRepos: RepoStat[] = (repos.user?.repositories.nodes ?? []).map((n) => ({
    nameWithOwner: n.nameWithOwner,
    description: n.description,
    stars: n.stargazerCount,
    forks: n.forkCount,
    language: n.primaryLanguage
      ? { name: n.primaryLanguage.name, color: n.primaryLanguage.color }
      : null,
    pushedAt: n.pushedAt,
    isArchived: Boolean(n.isArchived),
  }));

  const snapshot = normalizeStatsResponse(stats, topRepos, years);
  if (stats.user.avatarUrl) {
    snapshot.avatarDataUri = await fetchAvatarDataUri(stats.user.avatarUrl);
  }
  return snapshot;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  console.log(`::group::Sigil — generating ${requestedKinds.length} cards for @${username}`);

  const snapshot = await fetchSnapshot();
  const activeTheme = resolveTheme(theme);

  const workspace = process.env["GITHUB_WORKSPACE"] ?? ".";
  const dir = join(workspace, outputDir);
  mkdirSync(dir, { recursive: true });

  let filesWritten = 0;
  for (const kind of requestedKinds) {
    const params = CARD_PARAM_SCHEMAS[kind].parse({ user: username, theme });
    const svg = CARD_RENDERERS[kind]({
      snapshot,
      theme: activeTheme,
      params,
      now: new Date(),
    });
    writeFileSync(join(dir, `${kind}.svg`), svg, "utf-8");
    console.log(`  ✓ ${kind}.svg`);
    filesWritten++;
  }

  const outputFile = process.env["GITHUB_OUTPUT"];
  if (outputFile) {
    writeFileSync(outputFile, `files-written=${filesWritten}\n`, { flag: "a" });
  }

  console.log("::endgroup::");
  console.log(`✓ ${filesWritten} SVG files written to ${outputDir}/`);
}

run().catch((err: unknown) => {
  console.error("::error::", err instanceof Error ? err.message : err);
  process.exit(1);
});
