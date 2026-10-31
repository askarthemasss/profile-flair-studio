import { describe, it, expect } from "vitest";
import { CARD_PARAM_SCHEMAS } from "../params.js";

describe("card param schemas", () => {
  it("applies heatmap defaults so weeks is never undefined", () => {
    const parsed = CARD_PARAM_SCHEMAS.heatmap.parse({ user: "octocat" });
    expect(parsed.weeks).toBe(26);
    expect(parsed.show_month_labels).toBe("1");
  });

  it("coerces numeric query params", () => {
    const parsed = CARD_PARAM_SCHEMAS.achievements.parse({ user: "octocat", cols: "2" });
    expect(parsed.cols).toBe(2);
  });

  it("turns the languages hide list into an array", () => {
    const parsed = CARD_PARAM_SCHEMAS.languages.parse({
      user: "octocat",
      hide: "TypeScript, Rust,",
    });
    expect(parsed.hide).toEqual(["TypeScript", "Rust"]);
  });

  it("defaults the languages hide list to an empty array", () => {
    const parsed = CARD_PARAM_SCHEMAS.languages.parse({ user: "octocat" });
    expect(parsed.hide).toEqual([]);
  });

  it("rejects out-of-range weeks", () => {
    const result = CARD_PARAM_SCHEMAS.heatmap.safeParse({ user: "octocat", weeks: "8" });
    expect(result.success).toBe(false);
  });

  it("drops unknown query params", () => {
    const parsed = CARD_PARAM_SCHEMAS.overview.parse({ user: "octocat", bogus: "1" });
    expect("bogus" in parsed).toBe(false);
  });

  it("keeps common defaults for every card kind", () => {
    for (const schema of Object.values(CARD_PARAM_SCHEMAS)) {
      const parsed = schema.parse({ user: "octocat" });
      expect(parsed.theme).toBe("obsidian");
      expect(parsed.animate).toBe("1");
    }
  });
});
