import { describe, expect, test } from "bun:test";

import { DEMO_PROFILE } from "../src/demo";
import { renderCardSvg } from "../src/render/svg";
import { getTheme } from "../src/themes";

describe("renderCardSvg cache", () => {
  test("repeats an identical card without building a new document", () => {
    const theme = getTheme("obsidian");
    const first = renderCardSvg({
      kind: "overview",
      profile: DEMO_PROFILE,
      theme,
      animate: false,
    });
    const second = renderCardSvg({
      kind: "overview",
      profile: { ...DEMO_PROFILE },
      theme,
      animate: false,
    });
    expect(second).toBe(first);
    expect(first.startsWith("<svg")).toBe(true);
  });
});
