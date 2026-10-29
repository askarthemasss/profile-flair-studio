import type { CardRenderer } from "../types.js";
import type { BannerParams } from "../params.js";
import { SvgBuilder } from "../svg/builder.js";
import { escapeXml } from "../svg/escape.js";

export const renderBanner: CardRenderer<BannerParams> = ({ snapshot, theme, params }) => {
  const animate = params.animate === "1";
  const r = params.radius ?? theme.radius;
  const showAvatar = params.show_avatar === "1";
  const tagline = params.tagline ?? snapshot.bio ?? "Software Developer on GitHub";

  const width = 495;
  const height = 195;
  const b = new SvgBuilder({ width, height, theme, animate, radius: r }).open();

  // Subtle top accent line
  b.raw(`<rect x="0" y="0" width="${width}" height="4" fill="${escapeXml(theme.colors.accent)}"/>`);

  let textStartX = 24;

  // Avatar
  if (showAvatar) {
    const avatarSize = 56;
    const avatarX = 24;
    const avatarY = 28;

    if (snapshot.avatarDataUri) {
      b.raw(
        `<clipPath id="avatar-clip"><circle cx="${avatarX + avatarSize / 2}" cy="${
          avatarY + avatarSize / 2
        }" r="${avatarSize / 2}"/></clipPath>`,
      );
      b.raw(
        `<image href="${escapeXml(
          snapshot.avatarDataUri,
        )}" x="${avatarX}" y="${avatarY}" width="${avatarSize}" height="${avatarSize}" clip-path="url(#avatar-clip)"/>`,
      );
      b.raw(
        `<circle cx="${avatarX + avatarSize / 2}" cy="${
          avatarY + avatarSize / 2
        }" r="${avatarSize / 2}" fill="none" stroke="${escapeXml(
          theme.colors.border,
        )}" stroke-width="1.5"/>`,
      );
    } else {
      // Fallback monogram avatar
      const initial = (snapshot.name ?? snapshot.login).charAt(0).toUpperCase();
      b.raw(
        `<circle cx="${avatarX + avatarSize / 2}" cy="${
          avatarY + avatarSize / 2
        }" r="${avatarSize / 2}" fill="${escapeXml(theme.colors.bgAlt)}" stroke="${escapeXml(
          theme.colors.accent,
        )}" stroke-width="1.5"/>`,
      );
      b.text({
        x: avatarX + avatarSize / 2,
        y: avatarY + avatarSize / 2 + 6,
        content: initial,
        fontSize: 22,
        fontWeight: 700,
        fill: theme.colors.accent,
        anchor: "middle",
      });
    }

    textStartX = 94;
  }

  // Name & Handle
  b.text({
    x: textStartX,
    y: 44,
    content: snapshot.name ?? snapshot.login,
    fontSize: 16,
    fontWeight: 600,
    fill: theme.colors.text,
  });

  b.text({
    x: textStartX,
    y: 62,
    content: `@${snapshot.login}`,
    fontSize: 11,
    fill: theme.colors.textMuted,
  });

  // Tagline / Bio
  const clampedTagline = tagline.length > 75 ? `${tagline.slice(0, 72)}...` : tagline;
  b.text({
    x: 24,
    y: 106,
    content: clampedTagline,
    fontSize: 12,
    fill: theme.colors.text,
  });

  // Quick stats strip
  const pillY = 136;
  const stats = [
    { label: "Followers", val: snapshot.followers.toLocaleString() },
    { label: "Stars", val: snapshot.totals.starsEarned.toLocaleString() },
    { label: "Repos", val: snapshot.totals.ownedRepos.toString() },
  ];

  let pillX = 24;
  stats.forEach(({ label, val }) => {
    b.raw(
      `<rect x="${pillX}" y="${pillY}" width="105" height="34" rx="6" fill="${escapeXml(
        theme.colors.bgAlt,
      )}" stroke="${escapeXml(theme.colors.border)}" stroke-width="1"/>`,
    );
    b.text({
      x: pillX + 10,
      y: pillY + 16,
      content: val,
      fontSize: 12,
      fontWeight: 600,
      fill: theme.colors.accent,
    });
    b.text({
      x: pillX + 10,
      y: pillY + 28,
      content: label,
      fontSize: 9,
      fill: theme.colors.textMuted,
    });
    pillX += 115;
  });

  return b.build();
};
