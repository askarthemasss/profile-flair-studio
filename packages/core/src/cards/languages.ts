import type { CardRenderer } from "../types.js";
import type { LanguagesParams } from "../params.js";
import { SvgBuilder } from "../svg/builder.js";
import { computeLanguageShares } from "../stats/languages.js";
import { escapeXml } from "../svg/escape.js";

export const renderLanguages: CardRenderer<LanguagesParams> = ({ snapshot, theme, params }) => {
  const animate = params.animate === "1";
  const r = params.radius ?? theme.radius;
  const shares = computeLanguageShares(snapshot, params.langs_count, params.hide as string[]);

  const rowH = 22;
  const height = 48 + shares.length * rowH + 16;

  const b = new SvgBuilder({ width: 300, height, theme, animate, radius: r }).open();
  b.text({
    x: 24,
    y: 30,
    content: "Top Languages",
    fontSize: 13,
    fontWeight: 600,
    fill: theme.colors.text,
  });

  // Bar chart across top
  const barY = 44;
  const barH = 8;
  const barW = 252;
  b.rect({ x: 24, y: barY, width: barW, height: barH, fill: theme.colors.bgAlt, rx: 4 });

  let offsetX = 24;
  for (const lang of shares) {
    const w = Math.round((lang.pct / 100) * barW);
    b.raw(
      `<rect x="${offsetX}" y="${barY}" width="${w}" height="${barH}" fill="${escapeXml(lang.color ?? theme.colors.accent)}" />`,
    );
    offsetX += w;
  }

  // Language rows
  shares.forEach((lang, i) => {
    const y = 70 + i * rowH;
    const dotColor = escapeXml(lang.color ?? theme.colors.accent);
    b.raw(`<circle cx="30" cy="${y - 4}" r="5" fill="${dotColor}"/>`);
    b.text({ x: 42, y, content: lang.name, fontSize: 11, fill: theme.colors.text });
    b.text({
      x: 276,
      y,
      content: `${lang.pct}%`,
      fontSize: 10,
      fill: theme.colors.textMuted,
      anchor: "end",
    });
  });

  return b.build();
};
