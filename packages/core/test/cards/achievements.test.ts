import { describe, expect, test } from "bun:test";
import { renderCard } from "../../src/cards";
import { EMPTY, FIXTURE, NOW, THEME, golden } from "../fixture";

const params = {};

describe("achievements card", () => {
  test("golden", () => {
    expect(golden(renderCard("achievements", { snapshot: FIXTURE, theme: THEME, now: NOW, params }))).toMatchSnapshot();
  });

  test("static golden", () => {
    const out = renderCard("achievements", { snapshot: FIXTURE, theme: THEME, now: NOW, params: { ...params, animate: "0" } });
    expect(out).not.toContain("animation:");
    expect(golden(out)).toMatchSnapshot();
  });

  test("safe and deterministic", () => {
    const a = renderCard("achievements", { snapshot: FIXTURE, theme: THEME, now: NOW, params });
    expect(a).toBe(renderCard("achievements", { snapshot: FIXTURE, theme: THEME, now: NOW, params }));
    expect(a).not.toMatch(/<script|on[a-z]+=|javascript:/i);
    expect(a).not.toContain("<Fixture>");
    expect(a).not.toContain("<Weird>");
    expect(a).not.toContain("\u0007");
  });

  test("friendly zero state", () => {
    const out = renderCard("achievements", { snapshot: EMPTY, theme: THEME, now: NOW, params });
    expect(out).not.toMatch(/NaN|Infinity|undefined/);
    expect(out.startsWith("<svg")).toBe(true);
  });
});
