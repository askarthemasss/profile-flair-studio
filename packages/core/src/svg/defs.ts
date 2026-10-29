import type { Theme } from "../types.js";
import { escapeXml } from "./escape.js";

/**
 * Shared SVG defs: gradients, clip paths, patterns, and filter helpers.
 */

export function cardClipDef(id: string, width: number, height: number, rx: number): string {
  return `<clipPath id="${escapeXml(id)}"><rect width="${width}" height="${height}" rx="${rx}"/></clipPath>`;
}

export function gradientDef(
  id: string,
  from: string,
  to: string,
  direction: "horizontal" | "vertical" = "horizontal",
): string {
  const x2 = direction === "horizontal" ? "100%" : "0%";
  const y2 = direction === "vertical" ? "0%" : "100%";
  return `<linearGradient id="${escapeXml(id)}" x1="0%" y1="0%" x2="${x2}" y2="${y2}"><stop offset="0%" stop-color="${escapeXml(from)}"/><stop offset="100%" stop-color="${escapeXml(to)}"/></linearGradient>`;
}
