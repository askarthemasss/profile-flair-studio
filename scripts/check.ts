/**
 * Theme contrast + SVG renderer + contribution parser.
 * Run: bun scripts/check.ts
 */
import { readdirSync, readFileSync } from "node:fs";

import { missingProfile, buildProfile } from "../packages/core/src/build-profile";
import { parseContributionHtml, streaks } from "../packages/core/src/contributions";
import { DEMO_PROFILE } from "../packages/core/src/demo";
import { sigilMarkdown } from "../packages/core/src/markdown";
import { normalizeUsername, CARD_KIND_IDS } from "../packages/core/src/profile";
import { renderCardSvg } from "../packages/core/src/render/svg";
import { getTheme } from "../packages/core/src/themes/index";
import { themeViolations } from "../packages/core/src/themes/validate";

const failures: string[] = [];

function expect(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

const violations = themeViolations();
for (const violation of violations) {
  failures.push(
    `${violation.themeId} ${violation.pair} contrast ${violation.ratio.toFixed(2)} < ${violation.minimum}`,
  );
}

const theme = getTheme("obsidian");
for (const kind of CARD_KIND_IDS) {
  const svg = renderCardSvg({ kind, profile: DEMO_PROFILE, theme, animate: true });
  expect(svg.startsWith("<svg"), `${kind} svg opens`);
  expect(svg.endsWith("</svg>"), `${kind} svg closes`);
  expect(!svg.includes("<script"), `${kind} has no script`);
}

const hostile = {
  ...DEMO_PROFILE,
  name: `<script>alert(1)</script>`,
  bio: `a & b < c > d "q"`,
  username: "octocat",
};
const escaped = renderCardSvg({ kind: "banner", profile: hostile, theme, animate: false });
expect(!escaped.includes("<script>"), "name is escaped");
expect(escaped.includes("&lt;script&gt;"), "name entities present");
expect(escaped.includes("&amp;"), "ampersand escaped");
expect(!escaped.includes("animation:"), "animate=0 omits motion");

const animated = renderCardSvg({ kind: "overview", profile: DEMO_PROFILE, theme, animate: true });
expect(animated.includes("animation:"), "overview animates");

expect(normalizeUsername(" OctoCat ") === "octocat", "username normalized");
expect(normalizeUsername("-bad") === null, "leading hyphen rejected");
expect(normalizeUsername("a--b") === null, "double hyphen rejected");
expect(normalizeUsername("a".repeat(40)) === null, "too long rejected");

const html = `
  <h2>3 contributions in the last year</h2>
  <td data-date="2026-09-20" id="contribution-day-component-0-0" data-level="1"></td>
  <tool-tip for="contribution-day-component-0-0">2 contributions on September 20th.</tool-tip>
  <td data-date="2026-09-21" id="contribution-day-component-0-1" data-level="2"></td>
  <tool-tip for="contribution-day-component-0-1">1 contribution on September 21st.</tool-tip>
  <td data-level="0" id="contribution-day-component-0-2" data-date="2026-09-22"></td>
  <tool-tip for="contribution-day-component-0-2">No contributions on September 22nd.</tool-tip>
`;
const calendar = parseContributionHtml(html);
expect(calendar.total === 3, `total parsed (${calendar.total})`);
expect(calendar.days.length === 3, `three days (${calendar.days.length})`);
const yesterday = calendar.days.find((day) => day.date === "2026-09-21");
expect(yesterday?.count === 1, "tooltip count wins over level");
const streak = streaks(calendar.days, "2026-09-22");
expect(streak.current === 2, `current streak walks back through yesterday (${streak.current})`);
expect(streak.best === 2, `best streak (${streak.best})`);

const built = buildProfile({
  login: "octocat",
  name: "The Octocat",
  bio: "Mascot",
  followers: 10,
  publicRepos: 8,
  repos: [
    { name: "hello", description: "Hi", stars: 3, forks: 1, language: "Ruby", fork: false },
    { name: "spoon", description: null, stars: 100, forks: 2, language: "Ruby", fork: true },
  ],
  contributionsTotal: calendar.total,
  days: calendar.days,
  today: "2026-09-22",
});
expect(built.stars === 3, "fork stars are not counted");
expect(built.repo.name === "octocat/hello", "featured repo skips forks");
expect(built.languages[0]?.name === "Ruby", "language share");
expect(built.rankPercent >= 1 && built.rankPercent <= 99, "rank in range");
expect(built.heatmap.length === 182, "heatmap length");
expect(built.topRepos?.length === 1 && built.topRepos[0]?.name === "octocat/hello", "top repos skip forks");
expect(built.activity.length === 12, "activity length");

const missing = missingProfile("nobody");
expect(missing.bio === "No public GitHub profile", "missing profile stays calm");

const markdown = sigilMarkdown({
  username: "octocat",
  kinds: ["overview"],
  themeId: "paper",
  animate: false,
  staticBackup: true,
});
expect(
  markdown.includes("https://sigil.dev/c/overview/octocat?theme=paper&animate=0"),
  "markdown url",
);
expect(markdown.includes("Static backup"), "backup comment");

const migrations = readdirSync("drizzle/migrations")
  .filter((name) => name.endsWith(".sql"))
  .map((name) => readFileSync(`drizzle/migrations/${name}`, "utf8"))
  .join("\n");
expect(
  /grant\s+select\s+on\s+(table\s+)?public\.card_presets\s+to\s+anon/i.test(migrations),
  "anon can select card_presets so a public pack link opens signed out",
);

if (failures.length > 0) {
  console.error(failures.map((line) => `FAIL ${line}`).join("\n"));
  process.exit(1);
}

console.log(`ok — ${CARD_KIND_IDS.length} cards, ${violations.length} theme violations`);
