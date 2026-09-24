/**
 * CSS keyframes for cards. All motion is CSS (or SMIL) — never JavaScript.
 * Keyframes are parameter-free so identical names always mean identical rules,
 * even when several cards share one HTML page. Tune them with CSS variables.
 */
export const KEYFRAMES = {
  /** Stroke draws in. Pair with pathLength="1" and stroke-dasharray:1. */
  draw: "@keyframes sg-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}",
  /** Soft ember glow. */
  pulse: "@keyframes sg-pulse{0%,100%{opacity:1}50%{opacity:.45}}",
  /** Candle-like flicker. */
  flicker:
    "@keyframes sg-flicker{0%,100%{transform:scale(1,1)}25%{transform:scale(.96,1.05)}50%{transform:scale(1.03,.97)}75%{transform:scale(.98,1.03)}}",
  fade: "@keyframes sg-fade{from{opacity:0}to{opacity:1}}",
  /** Rise from `--rise` px below. */
  rise: "@keyframes sg-rise{from{opacity:0;transform:translateY(var(--rise,10px))}to{opacity:1;transform:none}}",
  shimmer: "@keyframes sg-shimmer{0%,70%,100%{opacity:0}80%{opacity:.55}}",
  /** Float up and back by `--fy` px. */
  float: "@keyframes sg-float{0%,100%{transform:translateY(0);opacity:.35}50%{transform:translateY(var(--fy,-14px));opacity:.9}}",
} as const;

export type KeyframeName = keyof typeof KEYFRAMES;

export function keyframes(...names: KeyframeName[]): string {
  return [...new Set(names)].map((name) => KEYFRAMES[name]).join("");
}

/** `animation` shorthand for a stagger driven by the `--c` custom property. */
export function stagger(name: KeyframeName, ms: number, stepMs: number): string {
  return `animation:sg-${name} ${ms}ms cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--c,0) * ${stepMs}ms)`;
}
