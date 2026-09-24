/**
 * SVG budgets. Fails CI on breach.
 * Typical card < 60 KB, skyline < 400 KB, hard ceiling 1 MB, fonts < 25 KB each (base64).
 * Run: bun scripts/check-svg-size.ts
 */
import { CARD_REGISTRY, renderCard } from "../packages/core/src/cards";
import { DEMO_PROFILE } from "../packages/core/src/demo";
import { CARD_KIND_IDS } from "../packages/core/src/profile";
import { snapshotFromProfile } from "../packages/core/src/snapshot";
import { FRAUNCES_WOFF, JETBRAINS_MONO_WOFF } from "../packages/core/src/svg/fonts.data";
import { BUILTIN_THEMES } from "../packages/core/src/themes/builtin";

const KB = 1024;
const CEILING = 1024 * KB;
const budget = (id: string) => (id === "skyline" ? 400 * KB : 60 * KB);
const failures: string[] = [];

for (const [name, font] of [
  ["Fraunces", FRAUNCES_WOFF],
  ["JetBrains Mono", JETBRAINS_MONO_WOFF],
] as const) {
  if (font.length > 25 * KB) failures.push(`${name} font ${(font.length / KB).toFixed(1)} KB > 25 KB`);
}

// A busy year so every card draws its heaviest shape.
const busy = snapshotFromProfile({
  ...DEMO_PROFILE,
  days: (DEMO_PROFILE.days ?? []).map((day, i) => ({ date: day.date, count: 1 + ((i * 37) % 60) })),
});
const variants: Record<string, Record<string, string>[]> = {
  heatmap: [{ shape: "square" }, { shape: "round" }, { shape: "hex" }],
  skyline: [{ flat: "1" }],
  activity: [{ range: "365" }],
  achievements: [{ count: "12" }],
  languages: [{ layout: "donut", count: "8" }, { layout: "radar", count: "8" }, { layout: "bars", count: "8" }],
};

const largest: Record<string, number> = {};
for (const theme of BUILTIN_THEMES) {
  for (const id of CARD_KIND_IDS) {
    for (const params of variants[id] ?? [{}]) {
      const bytes = new TextEncoder().encode(
        renderCard(id, { snapshot: busy, theme, now: "2026-09-22T12:00:00Z", params }),
      ).length;
      largest[id] = Math.max(largest[id] ?? 0, bytes);
      const limit = Math.min(budget(id), CEILING);
      if (bytes > limit) failures.push(`${id} (${theme.id}, ${JSON.stringify(params)}) ${(bytes / KB).toFixed(1)} KB > ${limit / KB} KB`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.map((line) => `FAIL ${line}`).join("\n"));
  process.exit(1);
}
console.log(
  Object.keys(CARD_REGISTRY)
    .map((id) => `${id.padEnd(13)} ${((largest[id] ?? 0) / KB).toFixed(1)} KB`)
    .join("\n"),
);
