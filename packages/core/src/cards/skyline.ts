import { z } from "zod";
import { mixHex } from "../color";
import { formatNumber } from "../svg/format";
import { heatColors } from "../svg/document";
import { keyframes, stagger } from "../svg/animations";
import { defineCard } from "./types";
import { calendarGrid } from "./heatmap";
import { mono, title } from "./shared";

const CELL = 8;
const MAX_H = 56;
const X0 = 212;
const Y0 = 88;
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

/** Fixed 30° isometric projection, integer-rounded. */
function iso(col: number, row: number, height = 0): string {
  const x = Math.round(X0 + (col - row) * CELL * COS);
  const y = Math.round(Y0 + (col + row) * CELL * SIN - height);
  return `${x},${y}`;
}

export const skyline = defineCard({
  id: "skyline",
  size: { w: 720, h: 340 },
  paramsSchema: z.object({
    year: z.coerce.number().int().min(2008).max(2100).optional(),
    flat: z.enum(["0", "1"]).default("1"),
  }),
  meta: {
    name: "Isometric skyline",
    description: "Your year as an isometric city: one column per day, height on a square-root scale.",
    defaults: { year: "", flat: "1" },
  },
  render: ({ snapshot, params, theme, now, animate }) => {
    const { cells, total } = calendarGrid(snapshot.days, now.slice(0, 10), params.year);
    const max = Math.max(1, ...cells.map((cell) => cell.count));
    const drawFlat = params.flat === "1" || total === 0;
    const weeks = new Map<number, string[]>();
    for (const cell of cells) {
      const h = cell.count > 0 ? Math.max(2, Math.round(Math.sqrt(cell.count / max) * MAX_H)) : 0;
      if (h === 0 && !drawFlat) continue;
      const { col: c, row: w } = cell;
      const lv = cell.level;
      const top = `<polygon points="${iso(c, w, h)} ${iso(c + 1, w, h)} ${iso(c + 1, w + 1, h)} ${iso(c, w + 1, h)}" class="h${lv}"/>`;
      const sides =
        h > 0
          ? `<polygon points="${iso(c, w + 1, h)} ${iso(c + 1, w + 1, h)} ${iso(c + 1, w + 1)} ${iso(c, w + 1)}" class="l${lv}"/><polygon points="${iso(
              c + 1,
              w + 1,
              h,
            )} ${iso(c + 1, w, h)} ${iso(c + 1, w)} ${iso(c + 1, w + 1)}" class="r${lv}"/>`
          : "";
      const list = weeks.get(c) ?? [];
      list.push(sides + top);
      weeks.set(c, list);
    }
    const heat = heatColors(theme);
    const faces = heat
      .map((color, i) => `.l${i}{fill:${mixHex(color, theme.bg, 0.3)}}.r${i}{fill:${mixHex(color, theme.bg, 0.5)}}`)
      .join("");
    const city = [...weeks.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([col, list]) => `<g class="wk" style="--c:${col}">${list.join("")}</g>`)
      .join("");
    const span = params.year ? String(params.year) : "the last year";

    return {
      title: `@${snapshot.login} — contribution skyline`,
      desc: `Isometric skyline of ${total} contributions in ${span}.`,
      body: `${title("Skyline")}${city}${mono(24, 300, `${formatNumber(total)} contributions`, "tx", 14)}${mono(
        24,
        318,
        total === 0 ? "An empty lot — every commit adds a floor" : `in ${span} · tallest day ${max}`,
        "mu",
        10,
      )}`,
      css: `${faces}${animate ? `.wk{--rise:14px;${stagger("rise", 600, 22)}}` : ""}`,
      keyframes: keyframes("rise"),
    };
  },
});
