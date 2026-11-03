import type { CardRenderer } from "../types.js";
import type { ActivityParams } from "../params.js";
import { SvgBuilder } from "../svg/builder.js";
import { escapeXml } from "../svg/escape.js";

export const renderActivity: CardRenderer<ActivityParams> = ({ snapshot, theme, params }) => {
  const animate = params.animate === "1";
  const r = params.radius ?? theme.radius;
  const numWeeks = params.weeks ?? 12;
  const showDots = params.show_dots === "1";

  // Gather recent daily contributions across years
  const allDays = snapshot.years
    .slice()
    .sort((a, b) => a.year - b.year)
    .flatMap((y) => y.days);

  const totalDaysNeeded = numWeeks * 7;
  const recentDays = allDays.length >= totalDaysNeeded ? allDays.slice(-totalDaysNeeded) : allDays;

  // Group into weekly buckets
  const weeklyTotals: number[] = [];
  for (let i = 0; i < recentDays.length; i += 7) {
    const week = recentDays.slice(i, i + 7);
    const sum = week.reduce((acc, val) => acc + val, 0);
    weeklyTotals.push(sum);
  }

  const maxVal = Math.max(...weeklyTotals, 1);
  const totalRecent = weeklyTotals.reduce((a, b) => a + b, 0);

  const width = 495;
  const height = 195;
  const b = new SvgBuilder({
    width,
    height,
    theme,
    animate,
    radius: r,
    border: params.hide_border !== "1",
  }).open();

  // Header
  b.text({
    x: 24,
    y: 36,
    content: "Activity Trends",
    fontSize: 15,
    fontWeight: 600,
    fill: theme.colors.text,
  });
  b.text({
    x: width - 24,
    y: 36,
    content: `${totalRecent.toLocaleString()} contribs (last ${numWeeks}w)`,
    fontSize: 11,
    fill: theme.colors.textMuted,
    anchor: "end",
  });

  // Chart area
  const chartX = 28;
  const chartY = 56;
  const chartW = width - 56;
  const chartH = 68;
  const baseY = chartY + chartH;

  if (weeklyTotals.length > 1) {
    const step = chartW / (weeklyTotals.length - 1);
    const points = weeklyTotals.map((val, idx) => {
      const x = chartX + idx * step;
      const y = baseY - (val / maxVal) * chartH;
      return { x, y };
    });

    const pathData = points.reduce((acc, pt, i) => {
      return i === 0
        ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
        : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, "");

    const areaData = `${pathData} L ${points[points.length - 1]!.x.toFixed(1)} ${baseY} L ${points[0]!.x.toFixed(1)} ${baseY} Z`;

    // Area fill
    b.raw(`<path d="${areaData}" fill="${escapeXml(theme.colors.accent)}" opacity="0.15"/>`);

    // Stroke line
    b.raw(
      `<path d="${pathData}" fill="none" stroke="${escapeXml(theme.colors.accent)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    );

    // Dots if enabled
    if (showDots) {
      points.forEach((pt) => {
        b.raw(
          `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3" fill="${escapeXml(theme.colors.accent)}" stroke="${escapeXml(theme.colors.bg)}" stroke-width="1.5"/>`,
        );
      });
    }
  }

  // Summary footer grid
  const metrics: [string, string | number][] = [
    ["Commits", snapshot.totals.commits.toLocaleString()],
    ["PRs Opened", snapshot.totals.prsOpened.toLocaleString()],
    ["PR Reviews", snapshot.totals.reviews.toLocaleString()],
    ["Issues", snapshot.totals.issues.toLocaleString()],
  ];

  const colWidth = (width - 48) / metrics.length;
  metrics.forEach(([label, val], idx) => {
    const x = 24 + idx * colWidth;
    const y = 152;
    b.text({
      x,
      y,
      content: String(val),
      fontSize: 14,
      fontWeight: 600,
      fill: theme.colors.text,
    });
    b.text({
      x,
      y: y + 16,
      content: label,
      fontSize: 10,
      fill: theme.colors.textMuted,
    });
  });

  return b.build();
};
