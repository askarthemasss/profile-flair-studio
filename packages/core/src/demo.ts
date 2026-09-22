import type { SigilProfile } from "./profile";

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
