import { mixHex } from "../color";
import type { CardTheme } from "../themes/types";
import { esc } from "./esc";
import { FRAUNCES_WOFF, JETBRAINS_MONO_WOFF } from "./fonts.data";

export interface SvgInput {
  w: number;
  h: number;
  title: string;
  desc: string;
  /** Raw <defs> children. Use `__ID__` for ids so they stay unique on a page. */
  defs?: string;
  body: string;
  theme: CardTheme;
  animate: boolean;
  /** Card rules. Scoped to this SVG automatically. No @-rules here. */
  css?: string;
  /** Output of `keyframes()`. Only emitted when animating. */
  keyframes?: string;
  border?: boolean;
  radius?: number;
}

const MONO_STACK = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
const SERIF_STACK = "Fraunces,ui-serif,Georgia,serif";

/** Five heat colors from empty to full, derived from the theme. */
export function heatColors(theme: CardTheme): string[] {
  return [
    mixHex(theme.bg, theme.border, 0.7),
    mixHex(theme.bg, theme.accent, 0.3),
    mixHex(theme.bg, theme.accent, 0.55),
    mixHex(theme.bg, theme.accent, 0.8),
    theme.accent,
  ];
}

/** FNV-1a, base36. Deterministic scope ids. */
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function scope(css: string, id: string): string {
  return css.replace(/(^|})\s*([^{}]+)\{/g, (_m, close: string, selector: string) => {
    const scoped = selector
      .split(",")
      .map((part) => `#${id} ${part.trim()}`)
      .join(",");
    return `${close}${scoped}{`;
  });
}

/**
 * Wrap a card body in a complete, self-contained SVG document:
 * viewBox, role="img", labelled title/desc, theme variables in one <style>,
 * and the theme's display font embedded as @font-face.
 */
export function svg(input: SvgInput): string {
  const { w, h, theme, animate } = input;
  const heat = heatColors(theme);
  const serifFont = theme.font === "jetbrains-mono" ? JETBRAINS_MONO_WOFF : FRAUNCES_WOFF;
  const serif = theme.font === "jetbrains-mono" ? MONO_STACK : SERIF_STACK;
  const vars = [
    `--bg:${theme.bg}`,
    `--tx:${theme.text}`,
    `--ac:${theme.accent}`,
    `--gl:${theme.accentGlow}`,
    `--gd:${theme.gold}`,
    `--mu:${theme.muted}`,
    `--bd:${theme.border}`,
    ...heat.map((c, i) => `--h${i}:${c}`),
  ].join(";");
  const base = [
    `{${vars}}`,
    `.sf{font-family:SigilDisplay,${serif};font-weight:500}`,
    `.mo{font-family:${MONO_STACK};font-variant-numeric:tabular-nums}`,
    ".tx{fill:var(--tx)}.mu{fill:var(--mu)}.ac{fill:var(--ac)}.gl{fill:var(--gl)}.gd{fill:var(--gd)}.bgf{fill:var(--bg)}",
    ".bd{fill:none;stroke:var(--bd)}",
    heat.map((_c, i) => `.h${i}{fill:var(--h${i})}`).join(""),
  ].join("");

  const draft = `${input.defs ?? ""}${input.body}${input.css ?? ""}${theme.id}${w}x${h}${animate}`;
  const id = `sg${hash(draft)}`;
  const rules = scope(`${base}${input.css ?? ""}`, id).replace(`#${id} {`, `#${id}{`);
  const motion = animate
    ? `${input.keyframes ?? ""}@media (prefers-reduced-motion:reduce){#${id} *{animation:none!important}}`
    : "";
  const radius = input.radius ?? 12;
  const frame = `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${radius}" fill="${theme.bg}"${
    input.border === false ? "" : ` stroke="${theme.border}"`
  }/>`;

  const doc = `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-t ${id}-d"><title id="${id}-t">${esc(
    input.title,
  )}</title><desc id="${id}-d">${esc(input.desc)}</desc><style>@font-face{font-family:SigilDisplay;src:url(data:font/woff;base64,${serifFont}) format("woff")}${rules}${motion}</style>${
    input.defs ? `<defs>${input.defs}</defs>` : ""
  }${frame}${input.body}</svg>`;
  return doc.replaceAll("__ID__", id);
}
