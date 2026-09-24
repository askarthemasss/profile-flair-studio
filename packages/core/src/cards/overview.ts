import { z } from "zod";
import { esc } from "../svg/esc";
import { formatNumber, wrapText } from "../svg/format";
import { keyframes } from "../svg/animations";
import { defineCard } from "./types";
import { label, list, mono, r, ring } from "./shared";

const STATS = [
  ["commits", "Commits"],
  ["prs", "PRs merged"],
  ["reviews", "Reviews"],
  ["issues", "Issues"],
  ["stars", "Stars earned"],
  ["followers", "Followers"],
] as const;

const AVATAR = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

/** Original rank emblem: hexagon with an inner facet. */
function emblem(cx: number, cy: number, size: number): string {
  const pts = (rad: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${r(cx + rad * Math.cos(a))},${r(cy + rad * Math.sin(a))}`;
    }).join(" ");
  return `<polygon points="${pts(size)}" fill="none" stroke="var(--gd)" stroke-width="1.5"/><polygon points="${pts(
    size * 0.5,
  )}" class="gd" opacity=".85"/>`;
}

export const overview = defineCard({
  id: "overview",
  size: { w: 480, h: 210 },
  paramsSchema: z.object({
    layout: z.enum(["default", "compact"]).default("default"),
    show: z.string().max(120).optional(),
  }),
  meta: {
    name: "Overview & rank",
    description: "Avatar with rank ring, six headline stats, and a rank emblem with tier and score.",
    defaults: { layout: "default", show: "commits,prs,reviews,issues,stars,followers" },
  },
  render: ({ snapshot, params, animate }) => {
    const s = snapshot.stats;
    const values: Record<(typeof STATS)[number][0], number> = {
      commits: s.commits,
      prs: s.prsMerged,
      reviews: s.reviews,
      issues: s.issues,
      stars: s.stars,
      followers: s.followers,
    };
    const wanted = list(params.show);
    const shown = STATS.filter(([key]) => wanted.length === 0 || wanted.includes(key));
    const stats = shown.length > 0 ? shown : STATS;
    const compact = params.layout === "compact";
    const left = compact ? 24 : 136;
    const colW = compact ? 146 : 112;

    const name = wrapText(snapshot.name || snapshot.login, compact ? 26 : 22, 1)[0] ?? "";
    const grid = stats
      .slice(0, 6)
      .map(([key, text], i) => {
        const x = left + (i % 3) * colW;
        const y = 118 + Math.floor(i / 3) * 52;
        return `${mono(x, y, formatNumber(values[key]), "tx", 18)}${label(x, y + 16, text)}`;
      })
      .join("");

    const { tier, score, percent } = snapshot.rank;
    const fraction = score / 100;
    const topLabel = `Top ${Math.max(1, Math.round(percent))}%`;
    let side: string;
    let defs = "";
    if (compact) {
      side = `${emblem(440, 44, 16)}<text x="410" y="40" class="sf gd" font-size="13" text-anchor="end">${esc(
        tier,
      )}</text>${mono(410, 56, topLabel, "mu", 10, "end")}`;
    } else {
      const avatar = snapshot.avatarDataUri && AVATAR.test(snapshot.avatarDataUri) ? snapshot.avatarDataUri : null;
      const initials = (snapshot.name || snapshot.login)
        .split(/\s+/)
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase();
      if (avatar) defs = `<clipPath id="__ID__-av"><circle cx="72" cy="80" r="38"/></clipPath>`;
      side = `<circle cx="72" cy="80" r="46" fill="none" stroke="var(--bd)" stroke-width="4"/>${ring(
        72,
        80,
        46,
        fraction,
        "rk",
      ).replace("<circle ", `<circle style="--len:${Math.round(fraction * 1000) / 1000}" `)}${
        avatar
          ? `<image href="${esc(avatar)}" x="34" y="42" width="76" height="76" clip-path="url(#__ID__-av)" preserveAspectRatio="xMidYMid slice"/>`
          : `<circle cx="72" cy="80" r="38" class="h1"/><text x="72" y="90" class="sf tx" font-size="26" text-anchor="middle">${esc(
              initials,
            )}</text>`
      }${emblem(34, 158, 8)}<text x="48" y="162" class="sf gd" font-size="13">${esc(tier)}</text>${mono(
        110,
        162,
        topLabel,
        "mu",
        9,
        "end",
      )}<rect x="26" y="174" width="84" height="5" rx="2.5" class="h0"/><rect x="26" y="174" width="${r(
        84 * fraction,
      )}" height="5" rx="2.5" class="ac"/>`;
    }

    return {
      title: `${snapshot.name || snapshot.login} — GitHub overview`,
      desc: `@${snapshot.login}: ${stats.map(([key, text]) => `${formatNumber(values[key])} ${text.toLowerCase()}`).join(", ")}. Rank ${tier}, ${topLabel.toLowerCase()}.`,
      defs,
      body: `<text x="${left}" y="52" class="sf tx" font-size="22">${esc(name)}</text>${mono(
        left,
        72,
        `@${snapshot.login}`,
        "mu",
        12,
      )}${side}${grid}`,
      css: `.rk{stroke:var(--ac)}${animate ? ".rk{animation:sg-draw 900ms cubic-bezier(.2,.8,.2,1) both}" : ""}`,
      keyframes: keyframes("draw"),
    };
  },
});
