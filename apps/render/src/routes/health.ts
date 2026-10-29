import { Hono } from "hono";
import type { RenderEnv } from "./card.js";

export const healthRoute = new Hono<{ Bindings: RenderEnv }>();

healthRoute.get("/health", (c) => {
  return c.json({
    status: "ok",
    version: "1.0.0",
    engine: "hono-cloudflare-workers",
    timestamp: new Date().toISOString(),
    env: c.env.ENVIRONMENT ?? "production",
  });
});
