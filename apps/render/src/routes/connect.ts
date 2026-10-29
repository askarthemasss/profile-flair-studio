import { Hono } from "hono";
import { encryptToken } from "../crypto/token-crypto.js";
import { SupabaseRest } from "../db/supabase-rest.js";
import type { RenderEnv } from "./card.js";

export const connectRoute = new Hono<{ Bindings: RenderEnv }>();

connectRoute.post("/connect", async (c) => {
  const body = await c.req.json<{ login: string; token: string }>();

  if (!body.login || !body.token) {
    return c.json({ error: "Missing login or token" }, 400);
  }

  if (!c.env.TOKEN_ENCRYPT_KEY) {
    return c.json({ error: "Encryption key not configured on server" }, 500);
  }

  const encrypted = await encryptToken(body.token, c.env.TOKEN_ENCRYPT_KEY);

  const supabase =
    c.env.SUPABASE_URL && (c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY)
      ? new SupabaseRest({
          url: c.env.SUPABASE_URL,
          serviceKey: c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY!,
        })
      : null;

  if (supabase) {
    await supabase.upsert("user_tokens", {
      login: body.login,
      encrypted_token: encrypted,
      updated_at: new Date().toISOString(),
    });
  }

  return c.json({ success: true, message: `Token connected for @${body.login}` });
});

connectRoute.delete("/connect/:username", async (c) => {
  const username = c.req.param("username");

  const supabase =
    c.env.SUPABASE_URL && (c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY)
      ? new SupabaseRest({
          url: c.env.SUPABASE_URL,
          serviceKey: c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY!,
        })
      : null;

  if (supabase) {
    await Promise.all([
      supabase.delete("user_tokens", `login=eq.${encodeURIComponent(username)}`),
      supabase.upsert("opt_outs", {
        login: username,
        created_at: new Date().toISOString(),
      }),
      supabase.delete("snapshots", `login=eq.${encodeURIComponent(username)}`),
    ]);
  }

  return c.json({ success: true, message: `Token revoked and opted out for @${username}` });
});
