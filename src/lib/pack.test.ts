import { describe, expect, test } from "bun:test";

import { DEFAULT_STUDIO } from "./studio-data";
import { applyPackToState, normalizePackName, packParamsFromState, parsePackParams } from "./pack";

const signupDefault = {
  theme: "obsidian",
  overrides: {},
  cards: [{ card: "overview" }, { card: "streak" }, { card: "languages" }, { card: "heatmap" }],
};

describe("parsePackParams", () => {
  test("reads the signup default and fills animation defaults", () => {
    const parsed = parsePackParams(signupDefault);
    expect(parsed?.theme).toBe("obsidian");
    expect(parsed?.animate).toBe(true);
    expect(parsed?.staticBackup).toBe(true);
    expect(parsed?.cards.map((card) => card.card)).toEqual([
      "overview",
      "streak",
      "languages",
      "heatmap",
    ]);
    expect(parsed?.username).toBe("");
  });

  test("keeps the stats alias and drops unknown cards", () => {
    const parsed = parsePackParams({
      theme: "not-a-theme",
      cards: ["stats", { card: "banner", params: { title: "Hi" } }, { card: "nope" }, "banner"],
      animate: false,
      username: "@OctoCat",
    });
    expect(parsed?.theme).toBe("obsidian");
    expect(parsed?.animate).toBe(false);
    expect(parsed?.username).toBe("octocat");
    expect(parsed?.cards).toEqual([
      { card: "overview" },
      { card: "banner", params: { title: "Hi" } },
    ]);
  });

  test("rejects a non-object", () => {
    expect(parsePackParams(null)).toBeNull();
    expect(parsePackParams([])).toBeNull();
  });
});

describe("pack round trip", () => {
  test("state keeps prior card params and overrides", () => {
    const previous = parsePackParams({
      ...signupDefault,
      overrides: { border: "sharp" },
      cards: [{ card: "overview", params: { hideRank: true } }, { card: "streak" }],
    });
    const state = applyPackToState(DEFAULT_STUDIO, previous!);
    expect(state.enabled.overview).toBe(true);
    expect(state.enabled.skyline).toBe(false);
    expect(state.enabled.streak).toBe(true);

    const next = packParamsFromState({ ...state, animate: false, username: "octocat" }, previous);
    expect(next.animate).toBe(false);
    expect(next.username).toBe("octocat");
    expect(next.overrides).toEqual({ border: "sharp" });
    expect(next.cards).toEqual([
      { card: "overview", params: { hideRank: true } },
      { card: "streak" },
    ]);
  });

  test("pack names are 1–60 characters", () => {
    expect(normalizePackName("  My   pack ")).toBe("My pack");
    expect(normalizePackName("")).toBeNull();
    expect(normalizePackName("x".repeat(61))).toBeNull();
  });
});
