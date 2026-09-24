import { z } from "zod";
import { esc } from "../svg/esc";
import { wrapText } from "../svg/format";
import { keyframes } from "../svg/animations";
import { defineCard } from "./types";
import { mono } from "./shared";

export const banner = defineCard({
  id: "banner",
  size: { w: 1200, h: 280 },
  paramsSchema: z.object({
    tagline: z.string().max(60).optional(),
    align: z.enum(["left", "center"]).default("left"),
  }),
  meta: {
    name: "Banner",
    description: "Your name large in Fraunces, a tagline, a rank chip, and slow floating embers.",
    defaults: { tagline: "", align: "left" },
  },
  render: ({ snapshot, params, animate }) => {
    const center = params.align === "center";
    const x = center ? 600 : 72;
    const anchor = center ? "middle" : "start";
    const name = wrapText(snapshot.name || snapshot.login, 26, 1)[0] ?? "";
    const tagline = wrapText(params.tagline || snapshot.bio || "", 60, 1)[0] ?? "";
    const chip = `Top ${Math.max(1, Math.round(snapshot.rank.percent))}% · ${snapshot.rank.tier}`;
    const chipW = chip.length * 7.8 + 28;
    const chipX = center ? 600 - chipW / 2 : x;

    const particles = Array.from({ length: 8 }, (_, i) => {
      const px = center ? 90 + ((i * 149) % 1020) : 700 + ((i * 131) % 440);
      const py = 60 + ((i * 53) % 170);
      const size = 1.6 + (i % 3) * 0.9;
      return `<circle cx="${px}" cy="${py}" r="${size}" class="${i % 2 ? "gl" : "ac"} pt" style="--d:${(4 + (i % 4) * 1.3).toFixed(1)}s;--dl:-${(i * 0.7).toFixed(1)}s;--fy:-${10 + (i % 3) * 6}px"/>`;
    }).join("");

    return {
      title: `${snapshot.name || snapshot.login} — banner`,
      desc: `${snapshot.name || snapshot.login}${tagline ? `: ${tagline}` : ""}. ${chip}.`,
      defs: `<radialGradient id="__ID__-glow" cx="${center ? 0.5 : 0.82}" cy="0.5" r="0.5"><stop offset="0" stop-color="var(--ac)" stop-opacity=".16"/><stop offset="1" stop-color="var(--ac)" stop-opacity="0"/></radialGradient>`,
      body: `<rect x="1" y="1" width="1198" height="278" rx="12" fill="url(#__ID__-glow)"/>${particles}${mono(
        x,
        78,
        `@${snapshot.login}`,
        "mu",
        14,
        anchor,
      )}<text x="${x}" y="150" class="sf tx" font-size="68" text-anchor="${anchor}">${esc(name)}</text>${
        tagline ? mono(x, 190, tagline, "mu", 18, anchor) : ""
      }<rect x="${chipX}" y="212" width="${chipW.toFixed(1)}" height="28" rx="14" fill="none" stroke="var(--gd)"/>${mono(
        chipX + chipW / 2,
        231,
        chip,
        "gd",
        13,
        "middle",
      )}`,
      css: `.pt{opacity:.6}${animate ? ".pt{animation:sg-float var(--d) ease-in-out infinite;animation-delay:var(--dl)}" : ""}`,
      keyframes: keyframes("float"),
    };
  },
});
