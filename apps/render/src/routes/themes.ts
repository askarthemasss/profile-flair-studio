import { Hono } from "hono";
import { BUILTIN_THEMES } from "@sigil/core";
import type { RenderEnv } from "./card.js";

export const themesRoute = new Hono<{ Bindings: RenderEnv }>();

themesRoute.get("/themes", (c) => {
  const list = Object.values(BUILTIN_THEMES);
  return c.json(list, 200, {
    "Cache-Control": "public, max-age=3600",
  });
});
