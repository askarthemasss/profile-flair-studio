import { z } from "zod";
import { formatNumber, monthName } from "../svg/format";
import { keyframes, stagger } from "../svg/animations";
import { defineCard } from "./types";
import { countsByDate, dayMs, DAY_MS, isoDay, levelScale } from "./data";
import { mono, r, title } from "./shared";

export interface CalendarCell {
  col: number;
  row: number;
  date: string;
  count: number;
  level: number;
}

/** 53 × 7 calendar ending on `end` (or Dec 31 of `year`), weeks start Sunday. */
export function calendarGrid(
  days: { date: string; count: number }[],
  today: string,
  year?: number,
): { cells: CalendarCell[]; total: number } {
  const end = year ? `${year}-12-31` : today;
  const endMs = dayMs(end);
  const limit = Math.min(endMs, dayMs(today));
  const first = endMs - new Date(endMs).getUTCDay() * DAY_MS - 52 * 7 * DAY_MS;
  const floor = year ? dayMs(`${year}-01-01`) : first;
  const map = countsByDate(days);
  const raw: Omit<CalendarCell, "level">[] = [];
  for (let col = 0; col < 53; col++) {
    for (let row = 0; row < 7; row++) {
      const ms = first + (col * 7 + row) * DAY_MS;
      if (ms > endMs || ms < floor) continue;
      const date = isoDay(ms);
      raw.push({ col, row, date, count: ms > limit ? 0 : (map.get(date) ?? 0) });
    }
  }
  const level = levelScale(raw.map((cell) => cell.count));
  return {
    cells: raw.map((cell) => ({ ...cell, level: level(cell.count) })),
    total: raw.reduce((sum, cell) => sum + cell.count, 0),
  };
}

const CELL = 10;
const STEP = 12;
const X0 = 48;
const Y0 = 58;

function shapeAt(shape: string, x: number, y: number, cls: string): string {
  if (shape === "round") return `<circle cx="${x + 5}" cy="${y + 5}" r="5" class="${cls}"/>`;
  if (shape === "hex") {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${r(x + 5 + 5.6 * Math.cos(a))},${r(y + 5 + 5.6 * Math.sin(a))}`;
    });
    return `<polygon points="${pts.join(" ")}" class="${cls}"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" class="${cls}"/>`;
}

export const heatmap = defineCard({
  id: "heatmap",
  size: { w: 720, h: 170 },
  paramsSchema: z.object({
    shape: z.enum(["square", "round", "hex"]).default("square"),
    year: z.coerce.number().int().min(2008).max(2100).optional(),
  }),
  meta: {
    name: "Contribution heatmap",
    description: "A 53 × 7 contribution calendar with month labels and a five-step legend.",
    defaults: { shape: "square", year: "" },
  },
  render: ({ snapshot, params, now, animate }) => {
    const { cells, total } = calendarGrid(snapshot.days, now.slice(0, 10), params.year);
    const columns = new Map<number, string[]>();
    const months: string[] = [];
    let lastMonth = -1;
    let lastLabelCol = -9;
    for (const cell of cells) {
      const x = X0 + cell.col * STEP;
      const y = Y0 + cell.row * STEP;
      const list = columns.get(cell.col) ?? [];
      list.push(shapeAt(params.shape, x, y, `h${cell.level}`));
      columns.set(cell.col, list);
      const month = new Date(dayMs(cell.date)).getUTCMonth();
      if (cell.row === 0 && month !== lastMonth) {
        if (cell.col < 51 && cell.col - lastLabelCol >= 3) {
          months.push(mono(x, Y0 - 8, monthName(month), "mu", 9));
          lastLabelCol = cell.col;
        }
        lastMonth = month;
      }
    }
    const grid = [...columns.entries()]
      .map(([col, shapes]) => `<g class="cl" style="--c:${col}">${shapes.join("")}</g>`)
      .join("");
    const legend = [0, 1, 2, 3, 4].map((level) => shapeAt(params.shape, 616 + level * 14, 150, `h${level}`)).join("");
    const span = params.year ? String(params.year) : "the last year";

    return {
      title: `@${snapshot.login} — contribution heatmap`,
      desc: `${total} contributions in ${span}.`,
      body: `${title("Contributions", 24, 30)}${mono(696, 30, `${formatNumber(total)} in ${span}`, "mu", 11, "end")}${months.join(
        "",
      )}${["Mon", "Wed", "Fri"].map((d, i) => mono(20, Y0 + (i * 2 + 1) * STEP + 9, d, "mu", 9)).join("")}${grid}${mono(
        610,
        159,
        "Less",
        "mu",
        9,
        "end",
      )}${legend}${mono(690, 159, "More", "mu", 9)}${
        total === 0 ? mono(48, 159, "No contributions yet — the first square is waiting", "mu", 10) : ""
      }`,
      css: animate ? `.cl{${stagger("fade", 500, 18)}}` : "",
      keyframes: keyframes("fade"),
    };
  },
});
