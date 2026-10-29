import type { CardRenderer } from "../types.js";
import type { OverviewParams } from "../params.js";
import { SvgBuilder } from "../svg/builder.js";
import { computeRank } from "../stats/rank.js";

export const renderOverview: CardRenderer<OverviewParams> = ({ snapshot, theme, params }) => {
  const rank = computeRank(snapshot);
  const animate = params.animate === "1";
  const r = params.radius ?? theme.radius;

  const b = new SvgBuilder({ width: 495, height: 195, theme, animate, radius: r }).open();

  // Title
  b.text({
    x: 24,
    y: 38,
    content: snapshot.name ?? snapshot.login,
    fontSize: 16,
    fontWeight: 600,
    fill: theme.colors.text,
  });
  b.text({
    x: 24,
    y: 56,
    content: `@${snapshot.login}`,
    fontSize: 11,
    fill: theme.colors.textMuted,
  });

  // Stats grid
  const stats: [string, string | number][] = [
    ["Commits", snapshot.totals.commits.toLocaleString()],
    ["PRs", snapshot.totals.prsOpened.toLocaleString()],
    ["Issues", snapshot.totals.issues.toLocaleString()],
    ["Reviews", snapshot.totals.reviews.toLocaleString()],
    ["Stars", snapshot.totals.starsEarned.toLocaleString()],
    ["Repos", snapshot.totals.ownedRepos.toString()],
  ];

  const colW = 155;
  stats.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 24 + col * colW;
    const y = 90 + row * 44;
    b.text({
      x,
      y,
      content: String(value),
      fontSize: 18,
      fontWeight: 600,
      fill: theme.colors.accent,
    });
    b.text({ x, y: y + 16, content: label, fontSize: 10, fill: theme.colors.textMuted });
  });

  // Rank badge (right side)
  if (params.show_rank === "1") {
    b.text({
      x: 455,
      y: 108,
      content: rank.tier.toUpperCase(),
      fontSize: 11,
      fontWeight: 700,
      fill: theme.colors.accent2,
      anchor: "middle",
    });
    b.text({
      x: 455,
      y: 120,
      content: "rank",
      fontSize: 9,
      fill: theme.colors.textMuted,
      anchor: "middle",
    });
  }

  return b.build();
};
