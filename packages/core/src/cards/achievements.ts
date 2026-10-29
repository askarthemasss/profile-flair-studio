import type { CardRenderer } from "../types.js";
import type { AchievementsParams } from "../params.js";
import { SvgBuilder } from "../svg/builder.js";
import { escapeXml } from "../svg/escape.js";
import { ACHIEVEMENT_DEFS, computeAchievements } from "../stats/achievements-defs.js";

const TIER_COLORS: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#a0aec0",
  gold: "#f59e0b",
  obsidian: "#a855f7",
};

export const renderAchievements: CardRenderer<AchievementsParams> = ({
  snapshot,
  theme,
  params,
}) => {
  const animate = params.animate === "1";
  const r = params.radius ?? theme.radius;
  const showUnearned = params.show_unearned === "1";
  const cols = Math.min(4, Math.max(1, params.cols ?? 3));

  const states = computeAchievements(snapshot);
  const defMap = new Map(ACHIEVEMENT_DEFS.map((d) => [d.id, d]));

  let items = states.map((s) => ({
    state: s,
    def: defMap.get(s.id)!,
  })).filter((item) => Boolean(item.def));

  if (!showUnearned) {
    items = items.filter((item) => item.state.tier !== null);
  }

  // Display at most 6 items to comfortably fit standard card height
  const displayed = items.slice(0, cols * 2);

  const width = 495;
  const height = 195;
  const b = new SvgBuilder({ width, height, theme, animate, radius: r }).open();

  // Header
  const earnedCount = states.filter((s) => s.tier !== null).length;
  b.text({
    x: 24,
    y: 36,
    content: "Achievements",
    fontSize: 15,
    fontWeight: 600,
    fill: theme.colors.text,
  });
  b.text({
    x: width - 24,
    y: 36,
    content: `${earnedCount} / ${ACHIEVEMENT_DEFS.length} unlocked`,
    fontSize: 11,
    fill: theme.colors.textMuted,
    anchor: "end",
  });

  // Grid
  const paddingX = 24;
  const availableW = width - paddingX * 2;
  const colW = availableW / cols;
  const startY = 56;
  const rowH = 56;

  displayed.forEach((item, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = paddingX + col * colW;
    const y = startY + row * rowH;

    const tier = item.state.tier;
    const badgeColor = tier ? TIER_COLORS[tier] ?? theme.colors.accent : theme.colors.textMuted;
    const isUnlocked = tier !== null;

    // Badge circle
    b.raw(
      `<circle cx="${x + 14}" cy="${y + 16}" r="12" fill="${escapeXml(
        isUnlocked ? badgeColor : theme.colors.bgAlt,
      )}" opacity="${isUnlocked ? "0.2" : "0.5"}" stroke="${escapeXml(
        badgeColor,
      )}" stroke-width="1.5"/>`,
    );

    // Initial / icon in badge
    const initial = item.def.name.charAt(0);
    b.text({
      x: x + 14,
      y: y + 20,
      content: initial,
      fontSize: 11,
      fontWeight: 700,
      fill: badgeColor,
      anchor: "middle",
    });

    // Achievement title & tier
    const labelX = x + 34;
    b.text({
      x: labelX,
      y: y + 14,
      content: item.def.name,
      fontSize: 11,
      fontWeight: 600,
      fill: isUnlocked ? theme.colors.text : theme.colors.textMuted,
    });

    const sub = isUnlocked
      ? `${tier!.toUpperCase()} · ${item.state.value.toLocaleString()}`
      : `Locked (${item.state.value}/${item.def.thresholds[0]})`;
    b.text({
      x: labelX,
      y: y + 27,
      content: sub,
      fontSize: 9,
      fill: isUnlocked ? badgeColor : theme.colors.textMuted,
    });
  });

  return b.build();
};
