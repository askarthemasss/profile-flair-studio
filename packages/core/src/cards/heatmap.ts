import type { CardRenderer } from "../types.js";
import type { HeatmapParams } from "../params.js";
import { SvgBuilder } from "../svg/builder.js";
import { escapeXml } from "../svg/escape.js";

const CELL = 11;
const GAP = 2;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const renderHeatmap: CardRenderer<HeatmapParams> = ({ snapshot, theme, params, now }) => {
  const animate = params.animate === "1";
  const weeks = params.weeks;
  const r = params.radius ?? theme.radius;

  // Collect last `weeks` weeks of contribution days
  const allDays = snapshot.years
    .flatMap((y) =>
      y.days.map((count, i) => {
        const d = new Date(y.year, 0, 1 + i);
        return { date: d.toISOString().slice(0, 10), count };
      }),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalCells = weeks * 7;
  const cells = allDays.slice(-totalCells);

  const gridW = weeks * (CELL + GAP) - GAP;
  const gridH = 7 * (CELL + GAP) - GAP;
  const height = gridH + 48 + (params.show_month_labels === "1" ? 20 : 0);
  const width = gridW + 48;

  const b = new SvgBuilder({
    width,
    height,
    theme,
    animate,
    radius: r,
    border: params.hide_border !== "1",
  }).open();
  b.text({
    x: 24,
    y: 28,
    content: "Contribution Heatmap",
    fontSize: 13,
    fontWeight: 600,
    fill: theme.colors.text,
  });

  const startY = params.show_month_labels === "1" ? 48 : 36;

  // Render cells
  cells.forEach((day, idx) => {
    const week = Math.floor(idx / 7);
    const dow = idx % 7;
    const x = 24 + week * (CELL + GAP);
    const y = startY + dow * (CELL + GAP);
    const intensity = day.count === 0 ? 0 : Math.min(4, Math.ceil(day.count / 3));
    const fill =
      intensity === 0 ? theme.colors.bgAlt : (theme.heat[intensity - 1] ?? theme.heat[3]);
    b.raw(
      `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${escapeXml(fill)}" data-date="${day.date}" data-count="${day.count}"/>`,
    );
  });

  // Month labels
  if (params.show_month_labels === "1") {
    let lastMonth = -1;
    cells.forEach((day, idx) => {
      const week = Math.floor(idx / 7);
      const month = new Date(day.date).getMonth();
      if (month !== lastMonth && idx % 7 === 0) {
        lastMonth = month;
        b.text({
          x: 24 + week * (CELL + GAP),
          y: startY - 6,
          content: MONTHS[month] ?? "",
          fontSize: 9,
          fill: theme.colors.textMuted,
        });
      }
    });
  }

  return b.build();
};
