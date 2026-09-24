import type { CardSnapshot } from "../src/snapshot";
import { obsidian } from "../src/themes/builtin/obsidian";

/** Fixed clock for every golden render. */
export const NOW = "2026-09-22T12:00:00Z";
export const THEME = obsidian;

const END = Date.parse("2026-09-22T00:00:00Z");

/** A fixed snapshot. Hostile strings check escaping end to end. */
export const FIXTURE: CardSnapshot = {
  login: "fixture-dev",
  name: "Ada <Fixture> & Co",
  bio: `Builds "careful" tools\u0007 for 'edge' runtimes`,
  stats: {
    commits: 4321,
    prsMerged: 87,
    reviews: 140,
    issues: 52,
    stars: 1530,
    followers: 212,
    contributions: 5120,
    repos: 41,
  },
  rank: { percent: 7, tier: "Ember", score: 93 },
  days: Array.from({ length: 371 }, (_, i) => ({
    date: new Date(END - (370 - i) * 86_400_000).toISOString().slice(0, 10),
    count: i > 350 ? 3 + (i % 4) : (i * 7) % 11 === 0 ? 0 : (i * 13) % 17,
  })),
  languages: [
    { name: "TypeScript", bytes: 500_000 },
    { name: "Rust", bytes: 300_000 },
    { name: "Go", bytes: 120_000 },
    { name: "Shell", bytes: 40_000 },
    { name: "<Weird>", bytes: 10_000 },
  ],
  topRepos: [
    {
      name: "fixture-dev/lantern",
      description: "A small & fast <static> site generator that fits in one file and never phones home.",
      stars: 980,
      forks: 44,
      language: "TypeScript",
      pushedAt: "2026-09-19T12:00:00Z",
    },
  ],
};

export const EMPTY: CardSnapshot = {
  ...FIXTURE,
  login: "quiet",
  name: "Quiet",
  stats: { commits: 0, prsMerged: 0, reviews: 0, issues: 0, stars: 0, followers: 0, contributions: 0, repos: 0 },
  rank: { percent: 100, tier: "Stone", score: 0 },
  days: [],
  languages: [],
  topRepos: [],
};

/** Keep golden files readable: the embedded font is checked by size, not by bytes. */
export function golden(svgText: string): string {
  return svgText.replace(/base64,[A-Za-z0-9+/=]+/, "base64,<font>");
}
