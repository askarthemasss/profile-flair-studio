import type { CardRenderer } from "../types.js";
import type { StreakParams } from "../params.js";
import { SvgBuilder } from "../svg/builder.js";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const renderStreak: CardRenderer<StreakParams> = ({ snapshot, theme, params }) => {
  const { streak } = snapshot;
  const animate = params.animate === "1";
  const r = params.radius ?? theme.radius;

  const b = new SvgBuilder({ width: 495, height: 195, theme, animate, radius: r }).open();

  // Label
  b.text({
    x: 247,
    y: 28,
    content: "Contribution Streak",
    fontSize: 13,
    fill: theme.colors.textMuted,
    anchor: "middle",
  });

  // Current streak
  if (params.hide_current_streak !== "1") {
    b.text({
      x: 124,
      y: 80,
      content: String(streak.current),
      fontSize: 36,
      fontWeight: 700,
      fill: theme.colors.accent,
      anchor: "middle",
    });
    b.text({
      x: 124,
      y: 98,
      content: "day streak",
      fontSize: 10,
      fill: theme.colors.textMuted,
      anchor: "middle",
    });
    if (streak.currentStart) {
      b.text({
        x: 124,
        y: 112,
        content: fmtDate(streak.currentStart),
        fontSize: 9,
        fill: theme.colors.textMuted,
        anchor: "middle",
        opacity: 0.6,
      });
    }
  }

  // Divider
  b.raw(
    `<line x1="247" y1="56" x2="247" y2="148" stroke="${theme.colors.border}" stroke-width="1" opacity="0.5"/>`,
  );

  // Longest streak
  if (params.hide_longest_streak !== "1") {
    b.text({
      x: 371,
      y: 80,
      content: String(streak.longest),
      fontSize: 36,
      fontWeight: 700,
      fill: theme.colors.accent2,
      anchor: "middle",
    });
    b.text({
      x: 371,
      y: 98,
      content: "longest",
      fontSize: 10,
      fill: theme.colors.textMuted,
      anchor: "middle",
    });
    if (streak.longestStart) {
      b.text({
        x: 371,
        y: 112,
        content: `${fmtDate(streak.longestStart)} → ${fmtDate(streak.longestEnd)}`,
        fontSize: 8,
        fill: theme.colors.textMuted,
        anchor: "middle",
        opacity: 0.6,
      });
    }
  }

  // Footer stats
  b.text({
    x: 24,
    y: 170,
    content: `${streak.totalContributions.toLocaleString()} total · ${streak.activeDays.toLocaleString()} active days`,
    fontSize: 10,
    fill: theme.colors.textMuted,
    opacity: 0.7,
  });

  return b.build();
};
