import {
  CARD_IDS,
  CARD_RENDERERS,
  resolveTheme,
  type CardId,
  type GithubSnapshot,
} from "../packages/core/src/index.js";

const mockSnapshot: GithubSnapshot = {
  schema: 1,
  login: "octocat",
  githubId: 583231,
  name: "The Octocat",
  bio: "Simulating profile cards for size budget verification.",
  createdAt: "2011-01-25T18:44:36Z",
  avatarDataUri: null,
  followers: 9420,
  following: 9,
  gists: 8,
  organizations: 4,
  totals: {
    commits: 2150,
    prsOpened: 84,
    prsMerged: 79,
    reviews: 42,
    issues: 18,
    ownedRepos: 12,
    contributedTo: 28,
    discussionAnswers: 6,
    starsEarned: 1420,
    forksEarned: 350,
    restrictedContributions: 120,
  },
  streak: {
    current: 12,
    currentStart: "2026-09-01T00:00:00Z",
    longest: 34,
    longestStart: "2025-03-01T00:00:00Z",
    longestEnd: "2025-04-04T00:00:00Z",
    totalContributions: 1840,
    activeDays: 210,
    busiestDay: { date: "2026-06-12", count: 18 },
  },
  years: [
    {
      year: 2026,
      total: 1840,
      days: Array.from({ length: 365 }, (_, i) => (i % 3 === 0 ? 3 : 0)),
    },
  ],
  languages: [
    { name: "TypeScript", color: "#3178c6", bytes: 320000 },
    { name: "Rust", color: "#dea584", bytes: 180000 },
    { name: "Go", color: "#00add8", bytes: 90000 },
  ],
  topRepos: [
    {
      nameWithOwner: "octocat/Hello-World",
      description: "My first repository on GitHub!",
      stars: 1240,
      forks: 310,
      language: { name: "TypeScript", color: "#3178c6" },
      pushedAt: new Date().toISOString(),
      isArchived: false,
    },
  ],
  fetchedAt: new Date().toISOString(),
  source: "public_pool",
};

const theme = resolveTheme("obsidian");
const MAX_BUDGET_BYTES = 45 * 1024; // 45 KB per SVG

let failed = false;

console.log("Checking SVG size budgets across all 9 cards...\n");

for (const cardId of CARD_IDS) {
  const renderer = CARD_RENDERERS[cardId as CardId];
  if (!renderer) {
    console.error(`❌ Missing renderer for card: ${cardId}`);
    failed = true;
    continue;
  }

  const svg = renderer({
    snapshot: mockSnapshot,
    theme,
    params: { user: "octocat", theme: "obsidian", animate: "1", hide_border: "0" },
    now: new Date(),
  });

  const bytes = Buffer.byteLength(svg, "utf-8");
  const kb = (bytes / 1024).toFixed(2);

  if (bytes > MAX_BUDGET_BYTES) {
    console.error(`❌ Card ${cardId} exceeds 45KB budget: ${kb} KB (${bytes} bytes)`);
    failed = true;
  } else {
    console.log(`✓ Card ${cardId.padEnd(14)}: ${kb.padStart(6)} KB (budget: 45 KB)`);
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log("\nAll cards passed the SVG size budget test!");
}
