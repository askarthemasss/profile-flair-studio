import type { CardRenderer, ContributionYear } from "../types.js";
import type { SkylineParams } from "../params.js";
import { SvgBuilder } from "../svg/builder.js";
import { escapeXml } from "../svg/escape.js";

const COLS = 52; // weeks in the year
const BAR_W = 7;
const BAR_GAP = 2;
const MAX_H = 80;

function getYearData(years: ContributionYear[], year: number): ContributionYear | undefined {
  return years.find((y) => y.year === year);
}

export const renderSkyline: CardRenderer<SkylineParams> = ({ snapshot, theme, params, now }) => {
  const animate = params.animate === "1";
  const r = params.radius ?? theme.radius;
  const year = params.year ?? now.getFullYear();

  const yearData = getYearData(snapshot.years, year);
  const days = yearData?.days ?? [];

  // Sum days into 52 weekly buckets
  const weeks: number[] = [];
  for (let w = 0; w < COLS; w++) {
    let sum = 0;
    for (let d = 0; d < 7; d++) sum += days[w * 7 + d] ?? 0;
    weeks.push(sum);
  }

  const maxVal = Math.max(...weeks, 1);
  const gridW = COLS * (BAR_W + BAR_GAP) - BAR_GAP;
  const width = gridW + 48;
  const height = MAX_H + 72;

  const b = new SvgBuilder({ width, height, theme, animate, radius: r }).open();
  b.text({
    x: 24,
    y: 28,
    content: `${year} Skyline`,
    fontSize: 13,
    fontWeight: 600,
    fill: theme.colors.text,
  });
  b.text({
    x: width - 24,
    y: 28,
    content: `${yearData?.total ?? 0} contributions`,
    fontSize: 10,
    fill: theme.colors.textMuted,
    anchor: "end",
  });

  const baseY = height - 24;

  weeks.forEach((val, i) => {
    const barH = Math.max(2, Math.round((val / maxVal) * MAX_H));
    const x = 24 + i * (BAR_W + BAR_GAP);
    const y = baseY - barH;
    const intensity = val === 0 ? 0 : Math.min(3, Math.floor((val / maxVal) * 4));
    const fill = val === 0 ? theme.colors.bgAlt : (theme.heat[intensity] ?? theme.colors.accent);
    b.raw(
      `<rect x="${x}" y="${y}" width="${BAR_W}" height="${barH}" rx="1" fill="${escapeXml(fill)}"/>`,
    );
  });

  return b.build();
};
