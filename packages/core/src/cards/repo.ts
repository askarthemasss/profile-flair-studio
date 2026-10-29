import type { CardRenderer, RepoStat } from "../types.js";
import type { RepoParams } from "../params.js";
import { SvgBuilder } from "../svg/builder.js";
import { escapeXml } from "../svg/escape.js";

export const renderRepo: CardRenderer<RepoParams> = ({ snapshot, theme, params }) => {
  const animate = params.animate === "1";
  const r = params.radius ?? theme.radius;
  const showDesc = params.show_description === "1";
  const showStats = params.show_stats === "1";

  // Find target repository
  let targetRepo: RepoStat | undefined;
  if (params.repo) {
    const q = params.repo.toLowerCase();
    targetRepo = snapshot.topRepos.find((rp) => {
      const full = rp.nameWithOwner.toLowerCase();
      return full === q || full.endsWith(`/${q}`);
    });
  }
  if (!targetRepo && snapshot.topRepos.length > 0) {
    targetRepo = snapshot.topRepos[0];
  }

  const repo: RepoStat = targetRepo ?? {
    nameWithOwner: `${snapshot.login}/${params.repo ?? "repository"}`,
    description: "Public repository on GitHub",
    stars: 0,
    forks: 0,
    language: null,
    pushedAt: new Date().toISOString(),
    isArchived: false,
  };

  const width = 400;
  const height = 195;
  const b = new SvgBuilder({ width, height, theme, animate, radius: r }).open();

  // Book/Repo icon (SVG path)
  b.raw(
    `<svg x="24" y="24" width="18" height="18" viewBox="0 0 16 16" fill="${escapeXml(
      theme.colors.accent,
    )}"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h6.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-6.5a.25.25 0 0 1-.25-.25Z"/></svg>`,
  );

  // Repo Title
  b.text({
    x: 48,
    y: 38,
    content: repo.nameWithOwner,
    fontSize: 14,
    fontWeight: 600,
    fill: theme.colors.accent,
  });

  if (repo.isArchived) {
    b.raw(
      `<rect x="${width - 78}" y="24" width="54" height="18" rx="9" fill="${escapeXml(
        theme.colors.bgAlt,
      )}" stroke="${escapeXml(theme.colors.border)}" stroke-width="1"/>`,
    );
    b.text({
      x: width - 51,
      y: 36,
      content: "Public archive",
      fontSize: 8,
      fill: theme.colors.textMuted,
      anchor: "middle",
    });
  }

  // Description
  if (showDesc && repo.description) {
    const truncated = repo.description.length > 80
      ? `${repo.description.slice(0, 77)}...`
      : repo.description;
    b.text({
      x: 24,
      y: 72,
      content: truncated,
      fontSize: 11,
      fill: theme.colors.textMuted,
    });
  }

  // Language & Stats Footer
  if (showStats) {
    let currX = 24;
    const footerY = 155;

    // Primary language
    if (repo.language) {
      const langColor = repo.language.color ?? theme.colors.accent;
      b.raw(
        `<circle cx="${currX + 5}" cy="${footerY - 4}" r="5" fill="${escapeXml(langColor)}"/>`,
      );
      b.text({
        x: currX + 16,
        y: footerY,
        content: repo.language.name,
        fontSize: 11,
        fill: theme.colors.text,
      });
      currX += repo.language.name.length * 7 + 36;
    }

    // Stars
    b.text({
      x: currX,
      y: footerY,
      content: `★ ${repo.stars.toLocaleString()}`,
      fontSize: 11,
      fill: theme.colors.textMuted,
    });
    currX += String(repo.stars).length * 8 + 36;

    // Forks
    b.text({
      x: currX,
      y: footerY,
      content: `⑂ ${repo.forks.toLocaleString()}`,
      fontSize: 11,
      fill: theme.colors.textMuted,
    });
  }

  return b.build();
};
