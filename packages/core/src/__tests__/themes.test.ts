import { describe, it, expect } from "vitest";
import { BUILTIN_THEMES, resolveTheme } from "../themes/resolve.js";
import { ThemeSchema } from "../types.js";
import { SvgBuilder } from "../svg/builder.js";

const themes = Object.entries(BUILTIN_THEMES);

describe("builtin themes", () => {
  it("ships six themes", () => {
    expect(themes.map(([id]) => id).sort()).toEqual([
      "monolith",
      "obsidian",
      "paper",
      "sandstone",
      "tidepool",
      "verdigris",
    ]);
  });

  it.each(themes)("validates %s against the theme schema", (id, theme) => {
    expect(theme.id).toBe(id);
    expect(ThemeSchema.safeParse(theme).success).toBe(true);
  });

  it("covers both light and dark modes", () => {
    const modes = new Set(themes.map(([, theme]) => theme.mode));
    expect(modes).toEqual(new Set(["light", "dark"]));
  });

  it("resolves every theme by id and falls back to obsidian", () => {
    for (const [id, theme] of themes) {
      expect(resolveTheme(id)).toBe(theme);
    }
    expect(resolveTheme("nope")).toBe(BUILTIN_THEMES.obsidian);
  });
});

describe("SvgBuilder", () => {
  it("uses the theme font stack for text", () => {
    const serif = new SvgBuilder({ theme: resolveTheme("paper") })
      .open()
      .text({ x: 0, y: 0, content: "x" })
      .build();
    expect(serif).toContain("Georgia");

    const sans = new SvgBuilder({ theme: resolveTheme("tidepool") })
      .open()
      .text({ x: 0, y: 0, content: "x" })
      .build();
    expect(sans).toContain("ui-sans-serif");

    const mono = new SvgBuilder({ theme: resolveTheme("obsidian") })
      .open()
      .text({ x: 0, y: 0, content: "x" })
      .build();
    expect(mono).toContain("ui-monospace");
  });

  it("lets a caller override the font family", () => {
    const svg = new SvgBuilder({ theme: resolveTheme("paper") })
      .open()
      .text({ x: 0, y: 0, content: "x", fontFamily: "Courier" })
      .build();
    expect(svg).toContain('font-family="Courier"');
  });

  it("draws the card border by default", () => {
    const theme = resolveTheme("monolith");
    const svg = new SvgBuilder({ theme }).open().build();
    expect(svg).toContain(`stroke="${theme.colors.border}"`);
    expect(svg).toContain('stroke-width="1"');
  });

  it("omits the border when asked, keeping the background", () => {
    const theme = resolveTheme("monolith");
    const svg = new SvgBuilder({ theme, border: false }).open().build();
    expect(svg).not.toContain("stroke=");
    expect(svg).toContain(`fill="${theme.colors.bg}"`);
  });
});
