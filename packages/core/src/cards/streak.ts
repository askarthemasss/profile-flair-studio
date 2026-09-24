import { z } from "zod";
import { formatNumber, shortDate } from "../svg/format";
import { keyframes } from "../svg/animations";
import { defineCard } from "./types";
import { streakRuns } from "./data";
import { label, mono, ring } from "./shared";

const MILESTONES = [7, 30, 100, 365];

export function nextMilestone(current: number, fixed?: number): number {
  if (fixed) return fixed;
  return MILESTONES.find((m) => m > current) ?? Math.ceil((current + 1) / 365) * 365;
}

const FLAME = "M0,-15C7,-6 10,0 7,6A7.5 7.5 0 0 1 -7,6C-10,0 -5,-4 0,-15Z";

export const streak = defineCard({
  id: "streak",
  size: { w: 480, h: 200 },
  paramsSchema: z.object({
    milestone: z.enum(["auto", "7", "30", "100", "365"]).default("auto"),
  }),
  meta: {
    name: "Streak",
    description: "Total contributions, the current streak inside a milestone ring, and the longest streak with dates.",
    defaults: { milestone: "auto" },
  },
  render: ({ snapshot, params, now, animate }) => {
    const today = now.slice(0, 10);
    const { current, longest } = streakRuns(snapshot.days, today);
    const goal = nextMilestone(current.length, params.milestone === "auto" ? undefined : Number(params.milestone));
    const progress = Math.min(1, current.length / goal);
    const first = snapshot.days.find((day) => day.count > 0)?.date;
    const total = snapshot.stats.contributions;
    const range = longest.length > 0 ? `${shortDate(longest.start)} – ${shortDate(longest.end)}` : "no streak yet";

    const body = [
      `<line x1="160" y1="44" x2="160" y2="170" class="bd"/><line x1="320" y1="44" x2="320" y2="170" class="bd"/>`,
      mono(80, 96, formatNumber(total), "tx", 26, "middle"),
      label(80, 120, "Total contributions", "middle"),
      mono(80, 140, first ? `since ${shortDate(first)}` : "a fresh start", "mu", 10, "middle"),
      `<circle cx="240" cy="92" r="44" fill="none" stroke="var(--bd)" stroke-width="5"/>`,
      `<circle cx="240" cy="92" r="44" fill="none" stroke="var(--gl)" stroke-width="9" class="gw"/>`,
      ring(240, 92, 44, progress, "sr", 5),
      `<g transform="translate(240 70)"><path d="${FLAME}" class="ac fl"/></g>`,
      mono(240, 110, String(current.length), "tx", 26, "middle"),
      label(240, 160, "Current streak", "middle"),
      mono(240, 176, `next · ${goal} days`, "mu", 10, "middle"),
      mono(400, 96, String(longest.length), "tx", 26, "middle"),
      label(400, 120, "Longest streak", "middle"),
      mono(400, 140, range, "mu", 10, "middle"),
    ].join("");

    return {
      title: `@${snapshot.login} — contribution streak`,
      desc: `${current.length}-day current streak, longest ${longest.length} days, ${total} total contributions.`,
      body,
      css: `.sr{stroke:var(--ac)}.gw{opacity:0}${
        animate
          ? ".fl{transform-box:fill-box;transform-origin:50% 100%;animation:sg-flicker 1.6s ease-in-out infinite}.gw{opacity:.18;animation:sg-pulse 3s ease-in-out infinite}"
          : ""
      }`,
      keyframes: keyframes("flicker", "pulse"),
    };
  },
});
