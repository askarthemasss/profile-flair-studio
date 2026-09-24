import type { SigilProfile } from "./profile";

const DEMO_END = Date.parse("2026-09-22T00:00:00Z");

/** 371 deterministic days ending 2026-09-22, with quiet weekends and a live streak. */
function buildDays(): { date: string; count: number }[] {
  return Array.from({ length: 371 }, (_, i) => {
    const ms = DEMO_END - (370 - i) * 86_400_000;
    const weekday = new Date(ms).getUTCDay();
    const wave = (Math.sin(i * 0.9) + Math.cos(i * 0.23) + 2) / 4;
    const quiet = i < 243 && (weekday === 0 || wave < 0.2);
    const count = quiet ? 0 : Math.max(1, Math.round(wave * (weekday === 6 ? 6 : 18)));
    return { date: new Date(ms).toISOString().slice(0, 10), count };
  });
}

/** Deterministic preview data. The live API never serves this for a real login. */
function buildHeatmap(): number[] {
  const cells: number[] = [];
  for (let i = 0; i < 7 * 26; i++) {
    const v = (Math.sin(i * 1.31) + Math.cos(i * 0.37) + 2) / 4;
    if (v < 0.22) cells.push(0);
    else if (v < 0.45) cells.push(1);
    else if (v < 0.68) cells.push(2);
    else if (v < 0.86) cells.push(3);
    else cells.push(4);
  }
  return cells;
}

export const DEMO_PROFILE: SigilProfile = {
  username: "veera-siddhan",
  name: "Veera Siddhan",
  bio: "Systems engineer · Rust, TypeScript, edge runtimes",
  contributions: 14203,
  repos: 212,
  stars: 4812,
  followers: 317,
  rankPercent: 3,
  streakCurrent: 128,
  streakBest: 204,
  languages: [
    { name: "Rust", pct: 46 },
    { name: "TypeScript", pct: 31 },
    { name: "Go", pct: 14 },
    { name: "Python", pct: 9 },
  ],
  heatmap: buildHeatmap(),
  days: buildDays(),
  asOf: "2026-09-22T12:00:00Z",
  commits: 9_841,
  prsMerged: 612,
  reviews: 1_204,
  issues: 388,
  languageBytes: [
    { name: "Rust", bytes: 4_610_000 },
    { name: "TypeScript", bytes: 3_120_000 },
    { name: "Go", bytes: 1_380_000 },
    { name: "Python", bytes: 870_000 },
    { name: "Shell", bytes: 190_000 },
    { name: "Nix", bytes: 64_000 },
  ],
  topRepos: [
    {
      name: "veera-siddhan/forgekit",
      description: "Zero-config static SVG cards for your profile. Survives the outage.",
      stars: 1284,
      forks: 84,
      language: "Rust",
      pushedAt: "2026-09-19T08:00:00Z",
    },
    {
      name: "veera-siddhan/edge-ledger",
      description: "A tiny append-only log for edge runtimes.",
      stars: 642,
      forks: 31,
      language: "TypeScript",
      pushedAt: "2026-08-30T10:00:00Z",
    },
  ],
  activity: [12, 28, 19, 41, 33, 22, 55, 38, 47, 31, 60, 44],
  achievements: [
    { name: "Commit Marathoner", earned: true },
    { name: "Streakkeeper", earned: true },
    { name: "Open Source Patron", earned: true },
    { name: "Architect", earned: true },
  ],
  repo: {
    name: "veera-siddhan/forgekit",
    description: "Zero-config static SVG cards for your profile. Survives the outage.",
    stars: 1284,
    forks: 84,
    language: "Rust",
  },
};
