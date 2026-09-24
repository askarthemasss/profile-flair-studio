import { z } from "zod";
import type { CardSnapshot } from "../snapshot";
import { esc } from "../svg/esc";
import { formatNumber } from "../svg/format";
import { keyframes } from "../svg/animations";
import { defineCard } from "./types";
import { streakRuns } from "./data";
import { label, list, mono, r, ring } from "./shared";

type Shape = "circle" | "star" | number;

interface Family {
  id: string;
  name: string;
  shape: Shape;
  thresholds: [number, number, number, number];
  value: (s: CardSnapshot, today: string) => number;
}

/** Twelve original emblem families. Shape by family, metal by tier. */
export const FAMILIES: Family[] = [
  { id: "commits", name: "Committer", shape: "circle", thresholds: [100, 1000, 5000, 20000], value: (s) => s.stats.commits },
  { id: "prs", name: "Merger", shape: 5, thresholds: [10, 50, 200, 1000], value: (s) => s.stats.prsMerged },
  { id: "reviews", name: "Reviewer", shape: 4, thresholds: [10, 50, 200, 1000], value: (s) => s.stats.reviews },
  { id: "stars", name: "Stargazer", shape: "star", thresholds: [10, 100, 1000, 10000], value: (s) => s.stats.stars },
  { id: "followers", name: "Beacon", shape: 6, thresholds: [10, 100, 1000, 10000], value: (s) => s.stats.followers },
  { id: "streak", name: "Streakkeeper", shape: 3, thresholds: [7, 30, 100, 365], value: (s, today) => streakRuns(s.days, today).longest.length },
  { id: "repos", name: "Architect", shape: 8, thresholds: [5, 25, 100, 300], value: (s) => s.stats.repos },
  { id: "polyglot", name: "Polyglot", shape: 7, thresholds: [2, 4, 6, 10], value: (s) => s.languages.filter((l) => l.bytes > 0).length },
  { id: "issues", name: "Tracker", shape: 9, thresholds: [10, 50, 200, 1000], value: (s) => s.stats.issues },
  { id: "contributions", name: "Marathoner", shape: 10, thresholds: [100, 1000, 5000, 20000], value: (s) => s.stats.contributions },
  { id: "active", name: "Regular", shape: 12, thresholds: [30, 100, 200, 300], value: (s) => s.days.filter((d) => d.count > 0).length },
  { id: "peak", name: "Surge", shape: 11, thresholds: [5, 15, 40, 100], value: (s) => Math.max(0, ...s.days.map((d) => d.count)) },
];

const TIER_NAMES = ["Locked", "Bronze", "Silver", "Gold", "Obsidian"];

function tierOf(value: number, thresholds: number[]): { tier: number; progress: number; next: number | null } {
  const tier = thresholds.filter((t) => value >= t).length;
  const prev = tier === 0 ? 0 : (thresholds[tier - 1] ?? 0);
  const next = thresholds[tier] ?? null;
  return { tier, next, progress: next === null ? 1 : (value - prev) / (next - prev) };
}

function shapePath(shape: Shape, cx: number, cy: number, size: number): string {
  if (shape === "circle") return `<circle cx="${cx}" cy="${cy}" r="${size}"`;
  const sides = shape === "star" ? 16 : shape;
  const pts = Array.from({ length: sides }, (_, i) => {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const rad = shape === "star" && i % 2 ? size * 0.55 : size;
    return `${r(cx + rad * Math.cos(a))},${r(cy + rad * Math.sin(a))}`;
  });
  return `<polygon points="${pts.join(" ")}"`;
}

/** GitHub's own badges can only be estimated from public data. Names only, no artwork. */
function estimated(s: CardSnapshot): { name: string; tier: number }[] {
  const topStars = Math.max(0, ...s.topRepos.map((repo) => repo.stars));
  const tiers = (v: number, t: number[]) => t.filter((x) => v >= x).length;
  return [
    { name: "Starstruck", tier: tiers(topStars, [16, 128, 512, 4096]) },
    { name: "Pull Shark", tier: tiers(s.stats.prsMerged, [2, 16, 128, 1024]) },
  ];
}

export const achievements = defineCard({
  id: "achievements",
  size: { w: 720, h: 260 },
  paramsSchema: z.object({
    count: z.coerce.number().int().min(4).max(12).default(8),
    family: z.string().max(200).optional(),
    show_estimated: z.enum(["0", "1"]).default("1"),
  }),
  meta: {
    name: "Achievements",
    description: "Original geometric emblems: shape by family, metal by tier, and a progress arc to the next tier.",
    defaults: { count: "8", family: "", show_estimated: "1" },
  },
  render: ({ snapshot, params, theme, now, animate }) => {
    const today = now.slice(0, 10);
    const wanted = list(params.family);
    const picked = wanted.length ? FAMILIES.filter((f) => wanted.includes(f.id)) : FAMILIES;
    const families = (picked.length ? picked : FAMILIES).slice(0, params.count);
    const n = families.length;
    const cols = n <= 6 ? n : Math.ceil(n / 2);
    const cellW = 672 / cols;
    const rows = Math.ceil(n / cols);
    const metal = [
      null,
      ["#8a5a36", "#e2a878"],
      ["#8e98a3", "#eef1f4"],
      [theme.gold, theme.accentGlow],
      [theme.border, theme.accent],
    ];
    const defs = metal
      .map((stops, i) =>
        stops
          ? `<linearGradient id="__ID__-m${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${stops[1]}"/><stop offset="1" stop-color="${stops[0]}"/></linearGradient>`
          : "",
      )
      .join("");

    let earned = 0;
    const emblems = families
      .map((family, i) => {
        const value = family.value(snapshot, today);
        const { tier, progress, next } = tierOf(value, family.thresholds);
        if (tier > 0) earned++;
        const cx = Math.round(24 + cellW * ((i % cols) + 0.5));
        const cy = rows === 1 ? 110 : 84 + Math.floor(i / cols) * 84;
        const base = shapePath(family.shape, cx, cy, 18);
        const fill = tier === 0 ? ` class="h0" stroke="var(--bd)"` : ` fill="url(#__ID__-m${tier})"`;
        const shimmer = tier >= 3 ? `${base} class="sh" style="--c:${i}"/>` : "";
        return `<circle cx="${cx}" cy="${cy}" r="25" fill="none" stroke="var(--bd)" stroke-width="2.5"/>${ring(
          cx,
          cy,
          25,
          progress,
          tier === 0 ? "pa mu-s" : "pa",
          2.5,
        )}${base}${fill}/>${shimmer}${mono(cx, cy + 40, family.name, "tx", 9, "middle")}${mono(
          cx,
          cy + 51,
          next === null ? TIER_NAMES[tier] ?? "" : `${TIER_NAMES[tier]} · ${formatNumber(value)}/${formatNumber(next)}`,
          "mu",
          8,
          "middle",
        )}`;
      })
      .join("");

    const badges = estimated(snapshot);
    const estimatedRow =
      params.show_estimated === "1"
        ? `${label(24, 246, "Estimated GitHub badges (approx.)")}${badges
            .map(
              (badge, i) =>
                `<text x="${260 + i * 130}" y="246" class="mo ${badge.tier ? "gd" : "mu"}" font-size="10">${esc(
                  badge.name,
                )}${badge.tier > 1 ? ` x${badge.tier}` : badge.tier ? "" : " —"}</text>`,
            )
            .join("")}`
        : "";

    return {
      title: `@${snapshot.login} — achievements`,
      desc: `${earned} of ${n} emblems earned.`,
      defs,
      body: `<text x="24" y="36" class="sf tx" font-size="15">Achievements</text>${mono(
        696,
        36,
        `${earned}/${n} earned`,
        "mu",
        11,
        "end",
      )}${emblems}${estimatedRow}`,
      css: `.pa{stroke:var(--gd)}.mu-s{stroke:var(--mu)}.sh{fill:var(--tx);opacity:0}${
        animate ? ".sh{animation:sg-shimmer 4s ease-in-out infinite;animation-delay:calc(var(--c) * 300ms)}" : ""
      }`,
      keyframes: keyframes("shimmer"),
    };
  },
});
