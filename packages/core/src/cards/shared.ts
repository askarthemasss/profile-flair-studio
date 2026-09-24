import { ensureContrast, mixHex } from "../color";
import type { CardTheme } from "../themes/types";
import { esc } from "../svg/esc";

/** Round to one decimal for compact coordinates. */
export const r = (n: number) => String(Math.round(n * 10) / 10);

/** Card title in the display face. `title` is code-owned but still escaped. */
export function title(text: string, x = 24, y = 36): string {
  return `<text x="${x}" y="${y}" class="sf tx" font-size="15">${esc(text)}</text>`;
}

/** Mono text with an escaped value. */
export function mono(
  x: number,
  y: number,
  text: string,
  cls = "mu",
  size = 11,
  anchor: "start" | "middle" | "end" = "start",
): string {
  const a = anchor === "start" ? "" : ` text-anchor="${anchor}"`;
  return `<text x="${r(x)}" y="${r(y)}" class="mo ${cls}" font-size="${size}"${a}>${esc(text)}</text>`;
}

/** Small uppercase caption. */
export function label(x: number, y: number, text: string, anchor: "start" | "middle" | "end" = "start"): string {
  return mono(x, y, text.toUpperCase(), "mu", 9, anchor).replace("<text ", '<text letter-spacing="1.2" ');
}

/** A calm, centered message for empty and missing states. */
export function notice(w: number, y: number, headline: string, detail: string): string {
  return `<text x="${w / 2}" y="${y}" class="sf tx" font-size="16" text-anchor="middle">${esc(headline)}</text>${mono(
    w / 2,
    y + 22,
    detail,
    "mu",
    11,
    "middle",
  )}`;
}

/** Geometric icons (original, no third-party artwork). */
export const icon = {
  star: (x: number, y: number, s = 10) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rad = i % 2 ? s * 0.42 : s / 2;
      return `${r(x + s / 2 + rad * Math.cos(a))},${r(y + s / 2 + rad * Math.sin(a))}`;
    });
    return `<polygon points="${pts.join(" ")}" class="mu"/>`;
  },
  fork: (x: number, y: number) =>
    `<path d="M${x + 2},${y}v4a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3v-4M${x + 5},${y + 7}v3" fill="none" stroke="var(--mu)" stroke-width="1.4" stroke-linecap="round"/>`,
  diamond: (x: number, y: number, s = 10) =>
    `<polygon points="${x + s / 2},${y} ${x + s},${y + s / 2} ${x + s / 2},${y + s} ${x},${y + s / 2}" class="ac"/>`,
};

/** GitHub language colors (public linguist palette) for common languages. */
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Lua: "#000080",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Scala: "#c22d40",
  Zig: "#ec915c",
  Nix: "#7e7eff",
  "Jupyter Notebook": "#DA5B0B",
  R: "#198CE7",
  Julia: "#a270ba",
  OCaml: "#ef7a08",
  Clojure: "#db5855",
  Perl: "#0298c3",
  Dockerfile: "#384d54",
  MDX: "#fcb32c",
};

function fallbackColor(name: string, theme: CardTheme): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return mixHex(theme.accent, h % 2 ? theme.gold : theme.accentGlow, (h % 7) / 7);
}

/** Language color adjusted to pass 3:1 on the card background. */
export function languageColor(name: string, theme: CardTheme): string {
  return ensureContrast(LANGUAGE_COLORS[name] ?? fallbackColor(name, theme), theme.bg, 3);
}

/** Split a comma list param into lowercase tokens. */
export function list(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

/** Circle arc as a stroked circle with dash. `pathLength` normalizes to 1. */
export function ring(cx: number, cy: number, radius: number, fraction: number, cls: string, width = 4): string {
  const f = Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0));
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke-width="${width}" stroke-linecap="round" pathLength="1" stroke-dasharray="${Math.round(f * 1000) / 1000} 1" transform="rotate(-90 ${cx} ${cy})" class="${cls}"/>`;
}
