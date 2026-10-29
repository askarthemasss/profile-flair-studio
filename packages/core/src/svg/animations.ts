import type { Theme } from "../types.js";

/** Standard card animation keyframes (injected once per SVG). */
export function animationDefs(animate: boolean): string {
  if (!animate) return "";
  return `
  <defs>
    <style>
      @keyframes sg-fade-in {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes sg-breath {
        0%, 100% { opacity: 0.75; }
        50%       { opacity: 1; }
      }
      @keyframes sg-count-up {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .sg-fade  { animation: sg-fade-in 0.5s cubic-bezier(0.2,0.8,0.2,1) both; }
      .sg-breath{ animation: sg-breath 3s ease-in-out infinite; }
    </style>
  </defs>`;
}

/** Glow filter definition — used when theme.effects.glow is true. */
export function glowFilterDef(theme: Theme, id = "sg-glow"): string {
  if (!theme.effects.glow) return "";
  return `
  <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feColorMatrix type="matrix"
      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

/** Grain texture filter — used when theme.effects.grain is true. */
export function grainFilterDef(id = "sg-grain"): string {
  return `
  <filter id="${id}">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="overlay" result="blend"/>
    <feComposite in="blend" in2="SourceGraphic" operator="in"/>
  </filter>`;
}
