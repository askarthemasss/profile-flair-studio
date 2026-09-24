import { z } from "zod";
import { wrapText } from "../svg/format";
import { keyframes } from "../svg/animations";
import { defineCard } from "./types";
import { languageColor, list, mono, notice, r, title } from "./shared";

export const languages = defineCard({
  id: "languages",
  size: { w: 480, h: 220 },
  paramsSchema: z.object({
    layout: z.enum(["donut", "radar", "bars"]).default("donut"),
    count: z.coerce.number().int().min(3).max(8).default(5),
    hide: z.string().max(200).optional(),
  }),
  meta: {
    name: "Languages",
    description: "Top languages by bytes in GitHub's language colors, with mono percentages.",
    defaults: { layout: "donut", count: "5", hide: "" },
  },
  render: ({ snapshot, params, theme, animate }) => {
    const hidden = list(params.hide);
    const visible = snapshot.languages.filter((l) => l.bytes > 0 && !hidden.includes(l.name.toLowerCase()));
    const sum = visible.reduce((acc, l) => acc + l.bytes, 0);
    const rows = [...visible]
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, params.count)
      .map((l) => ({ name: l.name, share: sum ? l.bytes / sum : 0, color: languageColor(l.name, theme) }));
    const out = {
      title: `@${snapshot.login} — top languages`,
      desc: rows.length
        ? rows.map((row) => `${row.name} ${(row.share * 100).toFixed(1)}%`).join(", ")
        : "No language data yet.",
      keyframes: keyframes("draw", "fade"),
    };
    if (rows.length === 0) {
      return { ...out, body: `${title("Languages")}${notice(240, 118, "No languages yet", "Push some code and they appear here")}` };
    }

    const pct = (share: number) => `${(share * 100).toFixed(1)}%`;
    const legend = (x: number, y: number, row: (typeof rows)[number], width: number) =>
      `<circle cx="${x + 4}" cy="${y - 4}" r="4" fill="${row.color}"/>${mono(x + 14, y, wrapText(row.name, 16, 1)[0] ?? "", "tx", 12)}${mono(x + width, y, pct(row.share), "mu", 11, "end")}`;

    let body = title("Languages");
    let css = "";
    if (params.layout === "donut") {
      let start = 0;
      const segments = rows
        .map((row, i) => {
          const len = Math.round(row.share * 1000) / 1000;
          const seg = `<circle cx="110" cy="122" r="58" fill="none" stroke="${row.color}" stroke-width="20" pathLength="1" stroke-dasharray="${len} 1" transform="rotate(${r(
            start * 360 - 90,
          )} 110 122)" class="dn" style="--len:${len};--c:${i}"/>`;
          start += row.share;
          return seg;
        })
        .join("");
      body += `<circle cx="110" cy="122" r="58" fill="none" stroke="var(--h0)" stroke-width="20"/>${segments}${mono(
        110,
        127,
        `${rows.length} langs`,
        "mu",
        11,
        "middle",
      )}${rows.map((row, i) => legend(214, 70 + i * 20, row, 240)).join("")}`;
      css = animate ? ".dn{animation:sg-draw 800ms cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--c) * 90ms)}" : "";
    } else if (params.layout === "bars") {
      let x = 24;
      const bar = rows
        .map((row) => {
          const w = row.share * 432;
          const rect = `<rect x="${r(x)}" y="56" width="${r(Math.max(0, w - 2))}" height="12" rx="3" fill="${row.color}"/>`;
          x += w;
          return rect;
        })
        .join("");
      body += `<rect x="24" y="56" width="432" height="12" rx="3" class="h0"/><g class="bar">${bar}</g>${rows
        .map((row, i) => legend(24 + (i % 2) * 222, 100 + Math.floor(i / 2) * 24, row, 200))
        .join("")}`;
      css = animate ? ".bar{animation:sg-fade 600ms ease-out both}" : "";
    } else {
      const top = Math.max(...rows.map((row) => row.share), 0.01);
      const axis = (i: number, scale: number) => {
        const a = (Math.PI * 2 * i) / rows.length - Math.PI / 2;
        return [110 + 64 * scale * Math.cos(a), 124 + 64 * scale * Math.sin(a)] as const;
      };
      const ringPts = (scale: number) => rows.map((_, i) => axis(i, scale).map(r).join(",")).join(" ");
      const shape = rows.map((row, i) => axis(i, Math.max(0.08, row.share / top)).map(r).join(",")).join(" ");
      body += `${[0.5, 1].map((s) => `<polygon points="${ringPts(s)}" class="bd"/>`).join("")}${rows
        .map((_, i) => {
          const [x, y] = axis(i, 1);
          return `<line x1="110" y1="124" x2="${r(x)}" y2="${r(y)}" class="bd"/>`;
        })
        .join("")}<polygon points="${shape}" fill="var(--ac)" fill-opacity=".28" stroke="var(--ac)" stroke-width="2" class="rd"/>${rows
        .map((row, i) => legend(214, 70 + i * 20, row, 240))
        .join("")}`;
      css = animate ? ".rd{animation:sg-fade 700ms ease-out both}" : "";
    }
    return { ...out, body, css };
  },
});
