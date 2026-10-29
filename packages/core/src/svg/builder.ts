/**
 * SVG card builder — fluent API for composing SVG string output.
 *
 * All card renderers use this builder to ensure consistent structure,
 * attribute ordering, and < 10 ms CPU budget compliance (pure string ops).
 */
import type { Theme } from "../types.js";
import { escapeXml } from "./escape.js";
import { animationDefs, glowFilterDef, grainFilterDef } from "./animations.js";

export interface CardDimensions {
  width: number;
  height: number;
}

export const CARD_WIDTHS: Record<string, number> = {
  overview: 495,
  streak: 495,
  languages: 300,
  heatmap: 495,
  skyline: 495,
  activity: 495,
  achievements: 495,
  repo: 400,
  banner: 495,
};

export const DEFAULT_HEIGHT = 195;

export class SvgBuilder {
  private readonly parts: string[] = [];
  private readonly w: number;
  private readonly h: number;
  private readonly theme: Theme;
  private readonly animate: boolean;
  private readonly radius: number;

  constructor(opts: {
    width?: number;
    height?: number;
    theme: Theme;
    animate?: boolean;
    radius?: number;
  }) {
    this.w = opts.width ?? 495;
    this.h = opts.height ?? DEFAULT_HEIGHT;
    this.theme = opts.theme;
    this.animate = opts.animate ?? true;
    this.radius = opts.radius ?? opts.theme.radius;
  }

  /** Open the SVG root element. */
  open(): this {
    const { w, h, theme, radius } = this;
    this.parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    );
    this.parts.push(animationDefs(this.animate));
    if (theme.effects.glow) this.parts.push(glowFilterDef(theme));
    if (theme.effects.grain) this.parts.push(grainFilterDef());

    // Card background
    this.parts.push(
      `<rect width="${w}" height="${h}" rx="${radius}" fill="${escapeXml(theme.colors.bg)}" stroke="${escapeXml(theme.colors.border)}" stroke-width="1"/>`,
    );
    return this;
  }

  /** Append raw SVG markup (caller is responsible for escaping). */
  raw(svg: string): this {
    this.parts.push(svg);
    return this;
  }

  /** Append a <text> element. */
  text(opts: {
    x: number;
    y: number;
    content: string;
    fill?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontFamily?: string;
    opacity?: number;
    anchor?: "start" | "middle" | "end";
    cls?: string;
  }): this {
    const {
      x,
      y,
      content,
      fill = this.theme.colors.text,
      fontSize = 13,
      fontWeight = "normal",
      fontFamily = "monospace",
      opacity,
      anchor = "start",
      cls,
    } = opts;
    const attrs = [
      `x="${x}"`,
      `y="${y}"`,
      `fill="${escapeXml(fill)}"`,
      `font-size="${fontSize}"`,
      `font-weight="${fontWeight}"`,
      `font-family="${escapeXml(fontFamily)}"`,
      `text-anchor="${anchor}"`,
      opacity !== undefined ? `opacity="${opacity}"` : "",
      cls ? `class="${cls}"` : "",
    ]
      .filter(Boolean)
      .join(" ");
    this.parts.push(`<text ${attrs}>${escapeXml(content)}</text>`);
    return this;
  }

  /** Append a <rect> element. */
  rect(opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    rx?: number;
    opacity?: number;
    cls?: string;
  }): this {
    const { x, y, width, height, fill = this.theme.colors.bgAlt, rx = 0, opacity, cls } = opts;
    const attrs = [
      `x="${x}"`,
      `y="${y}"`,
      `width="${width}"`,
      `height="${height}"`,
      `rx="${rx}"`,
      `fill="${escapeXml(fill)}"`,
      opacity !== undefined ? `opacity="${opacity}"` : "",
      cls ? `class="${cls}"` : "",
    ]
      .filter(Boolean)
      .join(" ");
    this.parts.push(`<rect ${attrs}/>`);
    return this;
  }

  /** Close the SVG element and return the final string. */
  build(): string {
    this.parts.push("</svg>");
    return this.parts.join("");
  }
}
