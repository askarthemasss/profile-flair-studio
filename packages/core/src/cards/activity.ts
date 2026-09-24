import { z } from "zod";
import { formatNumber, shortDate } from "../svg/format";
import { monotonePath } from "../svg/path";
import { keyframes } from "../svg/animations";
import { defineCard } from "./types";
import { dailySeries } from "./data";
import { mono, notice, r, title } from "./shared";

const L = 48;
const R = 696;
const TOP = 64;
const BASE = 196;

export function movingAverage(values: number[], window = 7): number[] {
  return values.map((_, i) => {
    const from = Math.max(0, i - window + 1);
    const slice = values.slice(from, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

export const activity = defineCard({
  id: "activity",
  size: { w: 720, h: 240 },
  paramsSchema: z.object({
    range: z.enum(["30", "90", "365"]).default("90"),
  }),
  meta: {
    name: "Activity graph",
    description: "Daily contributions as an area chart with a 7-day moving average and the peak day marked.",
    defaults: { range: "90" },
  },
  render: ({ snapshot, params, now, animate }) => {
    const days = Number(params.range);
    const series = dailySeries(snapshot.days, now.slice(0, 10), days);
    const counts = series.map((day) => day.count);
    const total = counts.reduce((a, b) => a + b, 0);
    const peak = Math.max(0, ...counts);
    const yMax = Math.max(4, peak);
    const step = (R - L) / Math.max(1, days - 1);
    const px = (i: number) => L + i * step;
    const py = (v: number) => BASE - (v / yMax) * (BASE - TOP);
    const head = `${title("Activity")}${mono(696, 36, `${formatNumber(total)} in the last ${days} days`, "mu", 11, "end")}`;
    const axis = `<line x1="${L}" y1="${BASE}" x2="${R}" y2="${BASE}" class="bd"/>${mono(
      L,
      216,
      shortDate(series[0]?.date ?? ""),
      "mu",
      9,
    )}${mono(R, 216, shortDate(series[series.length - 1]?.date ?? ""), "mu", 9, "end")}`;
    const out = {
      title: `@${snapshot.login} — activity`,
      desc: `${total} contributions over the last ${days} days, peak ${peak} in a day.`,
      keyframes: keyframes("draw", "fade"),
    };
    if (total === 0) {
      return { ...out, body: `${head}${axis}${notice(360, 124, "A quiet stretch", `No contributions in the last ${days} days`)}` };
    }

    const line = monotonePath(counts.map((v, i) => [px(i), py(v)]));
    const avg = monotonePath(movingAverage(counts).map((v, i) => [px(i), py(v)]));
    const peakIndex = counts.indexOf(peak);
    const peakX = px(peakIndex);
    const peakY = py(peak);
    const right = peakX > 560;
    const peakDay = series[peakIndex]?.date ?? "";

    return {
      ...out,
      defs: `<linearGradient id="__ID__-ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ac)" stop-opacity=".38"/><stop offset="1" stop-color="var(--ac)" stop-opacity="0"/></linearGradient>`,
      body: `${head}${mono(L - 8, TOP + 4, formatNumber(yMax), "mu", 9, "end")}${mono(L - 8, BASE, "0", "mu", 9, "end")}${axis}<path d="${line}L${R},${BASE}L${L},${BASE}Z" fill="url(#__ID__-ag)" class="ar"/><path d="${line}" fill="none" stroke="var(--ac)" stroke-opacity=".5" stroke-width="1"/><path d="${avg}" fill="none" stroke="var(--gl)" stroke-width="2.2" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" class="ma"/><circle cx="${r(
        peakX,
      )}" cy="${r(peakY)}" r="3.5" class="ac"/>${mono(
        peakX + (right ? -8 : 8),
        Math.max(TOP - 4, peakY - 6),
        `Peak · ${peak} on ${shortDate(peakDay)}`,
        "tx",
        10,
        right ? "end" : "start",
      )}`,
      css: animate
        ? ".ma{animation:sg-draw 1400ms cubic-bezier(.4,0,.2,1) both}.ar{animation:sg-fade 900ms ease-out both}"
        : "",
    };
  },
});
