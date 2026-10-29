/**
 * Color utilities for Sigil.
 *
 * WCAG 2.x relative luminance + contrast ratio, used by the CI theme validator
 * to enforce: text on background >= 4.5:1, accent on background >= 3:1.
 */

/** Convert an sRGB channel value (0-255) to linear light. */
function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.039_28 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Parse a #rrggbb hex string into its r, g, b channels (0-255). */
function parseHex(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const h = m?.[1];
  if (!h) throw new Error(`Invalid hex color (expected #rrggbb): ${hex}`);
  const n = Number.parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** WCAG relative luminance (0 = black, 1 = white) for a #rrggbb color. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG contrast ratio between two #rrggbb colors. Range 1..21. */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** True when `text` on `bg` meets the WCAG AA threshold (default 4.5:1). */
export function passesTextContrast(text: string, bg: string, min = 4.5): boolean {
  return contrastRatio(text, bg) >= min;
}

/** True when `accent` on `bg` meets the WCAG AA large/UI threshold (default 3:1). */
export function passesAccentContrast(accent: string, bg: string, min = 3): boolean {
  return contrastRatio(accent, bg) >= min;
}

/** Convert a #rrggbb hex to an rgba() string with the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
