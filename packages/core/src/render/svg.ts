import { hexToRgba } from "../color";
import type { CardTheme } from "../themes";
import type { CardKind, SigilProfile } from "../profile";

const WIDTH = 495;
const HEIGHT = 195;
const DISPLAY = "Fraunces, ui-serif, Georgia, serif";
const MONO = "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export interface RenderCardOptions {
  kind: CardKind;
  profile: SigilProfile;
  theme: CardTheme;
  animate: boolean;
}

export function renderCardSvg(options: RenderCardOptions): string {
  const body = BODIES[options.kind](options.profile, options.theme, options.animate);
  return shell(options.theme, options.animate, body, {
    label: `${options.kind} card for @${options.profile.username}`,
  });
}

const BODIES: Record<
  CardKind,
  (profile: SigilProfile, theme: CardTheme, animate: boolean) => string
> = {
  stats: statsBody,
  streak: streakBody,
  languages: languagesBody,
  heatmap: heatmapBody,
  skyline: skylineBody,
  activity: activityBody,
  achievements: achievementsBody,
  repo: repoBody,
  banner: bannerBody,
};

function shell(theme: CardTheme, animate: boolean, body: string, meta: { label: string }): string {
  const motion = animate
    ? `<style>
@keyframes sg-glow{0%,100%{opacity:1}50%{opacity:.55}}
.sg-live{animation:sg-glow 2.8s ease-in-out infinite}
</style>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${esc(meta.label)}">
<title>${esc(meta.label)}</title>
${motion}
<rect width="${WIDTH}" height="${HEIGHT}" rx="12" fill="${theme.bg}" stroke="${theme.border}"/>
${body}
</svg>`;
}

function header(theme: CardTheme, title: string, right = ""): string {
  return `<text x="20" y="32" fill="${theme.text}" font-family="${DISPLAY}" font-size="13" letter-spacing="1.6">${esc(title)}</text>
${right}`;
}

function statsBody(profile: SigilProfile, theme: CardTheme): string {
  const pill = rankPill(theme, profile.rankPercent);
  const boxes = [
    ["Repos", formatCount(profile.repos)],
    ["Stars", formatCount(profile.stars)],
    ["Followers", formatCount(profile.followers)],
  ];
  const boxW = 145;
  const boxMarkup = boxes
    .map(([label, value], index) => {
      const x = 20 + index * (boxW + 10);
      return `<rect x="${x}" y="118" width="${boxW}" height="56" rx="8" fill="${hexToRgba(theme.accent, 0.08)}"/>
<text x="${x + boxW / 2}" y="142" text-anchor="middle" fill="${theme.text}" font-family="${MONO}" font-size="16">${esc(value ?? "")}</text>
<text x="${x + boxW / 2}" y="160" text-anchor="middle" fill="${theme.muted}" font-family="${MONO}" font-size="9" letter-spacing="1.2">${esc((label ?? "").toUpperCase())}</text>`;
    })
    .join("\n");

  return `${header(theme, "STATS & RANK", pill)}
<text class="sg-live" x="20" y="86" fill="${theme.accent}" font-family="${MONO}" font-size="40">${formatCount(profile.contributions)}</text>
<text x="${20 + countWidth(profile.contributions)}" y="86" fill="${theme.muted}" font-family="${MONO}" font-size="11" letter-spacing="1.4">CONTRIBUTIONS</text>
${boxMarkup}`;
}

function streakBody(profile: SigilProfile, theme: CardTheme, animate: boolean): string {
  const days = profile.activity.slice(-7);
  const bars = days
    .map((value, index) => {
      const max = 60;
      const h = Math.max(10, Math.min(72, (value / max) * 72));
      const x = 20 + index * 24;
      const y = 168 - h;
      const opacity = 0.35 + (index / 7) * 0.65;
      const grow = animate
        ? `<animate attributeName="height" from="0" to="${h.toFixed(1)}" dur="0.6s" fill="freeze"/>
<animate attributeName="y" from="168" to="${y.toFixed(1)}" dur="0.6s" fill="freeze"/>`
        : "";
      return `<rect x="${x}" y="${y.toFixed(1)}" width="16" height="${h.toFixed(1)}" rx="3" fill="${theme.accent}" fill-opacity="${opacity.toFixed(2)}">${grow}</rect>`;
    })
    .join("\n");

  return `${header(theme, "STREAK", `<circle class="sg-live" cx="470" cy="27" r="4" fill="${theme.accent}"/>`)}
<text class="sg-live" x="20" y="92" fill="${theme.accent}" font-family="${MONO}" font-size="48">${profile.streakCurrent}</text>
<text x="${28 + String(profile.streakCurrent).length * 28}" y="92" fill="${theme.muted}" font-family="${MONO}" font-size="12" letter-spacing="1.4">DAY STREAK</text>
${bars}
<text x="200" y="168" fill="${theme.muted}" font-family="${MONO}" font-size="11">best · ${profile.streakBest} days</text>`;
}

function languagesBody(profile: SigilProfile, theme: CardTheme, animate: boolean): string {
  const rows = profile.languages.slice(0, 4);
  if (rows.length === 0) {
    return `${header(theme, "LANGUAGES")}
<text x="20" y="100" fill="${theme.muted}" font-family="${MONO}" font-size="13">No public languages yet</text>`;
  }
  const markup = rows
    .map((row, index) => {
      const y = 56 + index * 32;
      const track = 455;
      const width = Math.max(0, Math.min(track, (row.pct / 100) * track));
      const grow = animate
        ? `<animate attributeName="width" from="0" to="${width.toFixed(1)}" dur="0.7s" fill="freeze"/>`
        : "";
      return `<text x="20" y="${y}" fill="${theme.text}" font-family="${MONO}" font-size="12">${esc(row.name)}</text>
<text x="475" y="${y}" text-anchor="end" fill="${theme.muted}" font-family="${MONO}" font-size="12">${row.pct}%</text>
<rect x="20" y="${y + 8}" width="${track}" height="6" rx="3" fill="${hexToRgba(theme.accent, 0.14)}"/>
<rect x="20" y="${y + 8}" width="${width.toFixed(1)}" height="6" rx="3" fill="${theme.accent}">${grow}</rect>`;
    })
    .join("\n");
  return `${header(theme, "LANGUAGES")}
${markup}`;
}

function heatmapBody(profile: SigilProfile, theme: CardTheme): string {
  const cols = 26;
  const rows = 7;
  const cell = 12;
  const gap = 3;
  const originX = 20;
  const originY = 48;
  const rects: string[] = [];
  for (let i = 0; i < cols * rows; i++) {
    const week = Math.floor(i / rows);
    const day = i % rows;
    const level = profile.heatmap[i] ?? 0;
    const x = originX + week * (cell + gap);
    const y = originY + day * (cell + gap);
    const alpha = level <= 0 ? 0.06 : 0.22 + level * 0.18;
    rects.push(
      `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${theme.accent}" fill-opacity="${alpha.toFixed(2)}"/>`,
    );
  }
  const legend = [0, 1, 2, 3, 4]
    .map((level, index) => {
      const alpha = level <= 0 ? 0.06 : 0.22 + level * 0.18;
      const x = 248 + index * 16;
      return `<rect x="${x}" y="166" width="10" height="10" rx="2" fill="${theme.accent}" fill-opacity="${alpha.toFixed(2)}"/>`;
    })
    .join("\n");
  return `${header(theme, "CONTRIBUTIONS", `<text x="475" y="32" text-anchor="end" fill="${theme.muted}" font-family="${MONO}" font-size="11">26 WKS</text>`)}
${rects.join("\n")}
<text x="214" y="175" fill="${theme.muted}" font-family="${MONO}" font-size="10">less</text>
${legend}
<text x="332" y="175" fill="${theme.muted}" font-family="${MONO}" font-size="10">more</text>`;
}

function skylineBody(profile: SigilProfile, theme: CardTheme): string {
  const values = profile.activity.concat(profile.activity);
  const max = Math.max(...values, 1);
  const bw = 12;
  const gap = 4;
  const depth = 6;
  const total = values.length * (bw + gap);
  const start = (WIDTH - total) / 2;
  const base = 158;
  const towers = values
    .map((value, index) => {
      const h = Math.max(14, Math.min(86, (value / max) * 86));
      const x = start + index * (bw + gap);
      const y = base - h;
      return `<polygon points="${x},${y} ${x + depth},${y - depth} ${x + bw + depth},${y - depth} ${x + bw},${y}" fill="${theme.accentGlow}" fill-opacity="0.85"/>
<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${theme.accent}" fill-opacity="${(0.45 + (index % 6) * 0.08).toFixed(2)}"/>`;
    })
    .join("\n");
  return `${header(theme, "ISOMETRIC SKYLINE")}
<rect x="16" y="46" width="463" height="118" rx="8" fill="${hexToRgba(theme.accent, 0.05)}"/>
${towers}
<text x="20" y="182" fill="${theme.muted}" font-family="${MONO}" font-size="10">contributions · 3D skyline</text>`;
}

function activityBody(profile: SigilProfile, theme: CardTheme, animate: boolean): string {
  const values = profile.activity.slice(-12);
  const max = Math.max(...values, 1);
  const bw = 26;
  const gap = 10;
  const start = 24;
  const base = 158;
  const bars = values
    .map((value, index) => {
      const h = Math.max(6, (value / max) * 96);
      const x = start + index * (bw + gap);
      const y = base - h;
      const peak = value === max && value > 0;
      const grow = animate
        ? `<animate attributeName="height" from="0" to="${h.toFixed(1)}" dur="0.7s" fill="freeze"/>
<animate attributeName="y" from="${base}" to="${y.toFixed(1)}" dur="0.7s" fill="freeze"/>`
        : "";
      return `<rect x="${x}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="3" fill="${peak ? theme.accent : theme.accent}" fill-opacity="${peak ? "1" : "0.45"}">${grow}</rect>`;
    })
    .join("\n");
  return `${header(theme, "ACTIVITY")}
${bars}
<text x="20" y="180" fill="${theme.muted}" font-family="${MONO}" font-size="11">commits · last 12 weeks</text>`;
}

function achievementsBody(profile: SigilProfile, theme: CardTheme): string {
  const earned = profile.achievements.filter((badge) => badge.earned).length;
  let x = 20;
  let y = 56;
  const pills = profile.achievements
    .map((badge) => {
      const width = Math.max(72, badge.name.length * 6.5 + 20);
      if (x + width > 476) {
        x = 20;
        y += 32;
      }
      const stroke = badge.earned ? theme.gold : theme.border;
      const color = badge.earned ? theme.gold : theme.muted;
      const fill = badge.earned ? hexToRgba(theme.gold, 0.12) : "transparent";
      const pill = `<rect x="${x}" y="${y}" width="${width.toFixed(1)}" height="24" rx="12" fill="${fill}" stroke="${stroke}"/>
<text x="${(x + width / 2).toFixed(1)}" y="${y + 16}" text-anchor="middle" fill="${color}" font-family="${MONO}" font-size="11">${esc(badge.name)}</text>`;
      x += width + 8;
      return pill;
    })
    .join("\n");
  return `${header(theme, "ACHIEVEMENTS", `<text x="475" y="32" text-anchor="end" fill="${theme.muted}" font-family="${MONO}" font-size="11">${earned} EARNED</text>`)}
${pills}`;
}

function repoBody(profile: SigilProfile, theme: CardTheme): string {
  const description = truncate(profile.repo.description, 88);
  const lines = wrap(description, 52);
  const text = lines
    .slice(0, 2)
    .map(
      (line, index) =>
        `<text x="20" y="${78 + index * 20}" fill="${theme.muted}" font-family="${DISPLAY}" font-size="14">${esc(line)}</text>`,
    )
    .join("\n");
  return `${header(theme, "FEATURED REPO")}
<text x="20" y="58" fill="${theme.accent}" font-family="${MONO}" font-size="14">◆  ${esc(truncate(profile.repo.name, 42))}</text>
${text}
<text x="20" y="150" fill="${theme.muted}" font-family="${MONO}" font-size="12">${esc(profile.repo.language)}    ★ ${formatCount(profile.repo.stars)}    ⑂ ${formatCount(profile.repo.forks)}</text>`;
}

function bannerBody(profile: SigilProfile, theme: CardTheme): string {
  const id = `sg-banner-${profile.username.replace(/[^a-z0-9-]/g, "")}`;
  return `${header(theme, "BANNER")}
<defs>
<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${theme.accent}" stop-opacity="0.2"/>
<stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/>
</linearGradient>
</defs>
<rect x="16" y="50" width="463" height="120" rx="10" fill="url(#${id})" stroke="${theme.accent}" stroke-opacity="0.35"/>
<text x="36" y="108" fill="${theme.text}" font-family="${DISPLAY}" font-size="32">${esc(truncate(profile.name, 26))}</text>
<text x="36" y="138" fill="${theme.muted}" font-family="${MONO}" font-size="13">@${esc(profile.username)}  ·  ${esc(truncate(profile.bio, 48))}</text>`;
}

function rankPill(theme: CardTheme, percent: number): string {
  const label = `TOP ${percent}%`;
  const width = 18 + label.length * 7;
  const x = 475 - width;
  return `<rect x="${x}" y="16" width="${width}" height="20" rx="10" fill="transparent" stroke="${theme.gold}"/>
<text x="${x + width / 2}" y="30" text-anchor="middle" fill="${theme.gold}" font-family="${MONO}" font-size="10">${label}</text>`;
}

function formatCount(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/** Rough monospace advance so the caption sits just after the figure. */
function countWidth(value: number): number {
  return formatCount(value).length * 24 + 12;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function wrap(value: string, width: number): string[] {
  const words = value.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
