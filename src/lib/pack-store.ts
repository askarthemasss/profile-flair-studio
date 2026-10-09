import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

import type { PackParams } from "./pack";

export function packParamsJson(params: PackParams): Json {
  return {
    theme: params.theme,
    overrides: params.overrides as Json,
    cards: params.cards.map((card) =>
      card.params ? { card: card.card, params: card.params as Json } : { card: card.card },
    ),
    animate: params.animate,
    staticBackup: params.staticBackup,
    ...(params.username ? { username: params.username } : {}),
  };
}

export async function readCardPreset(id: string): Promise<
  | {
      id: string;
      name: string;
      isPublic: boolean;
      userId: string;
      params: unknown;
    }
  | { error: string }
  | null
> {
  // Signed-out reads use the anon role. Public rows are allowed by presets_select;
  // private rows stay hidden. See drizzle/migrations/0001_card_presets_public_read.sql.
  const { data, error } = await supabase
    .from("card_presets")
    .select("id, name, params, is_public, user_id")
    .eq("id", id)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    isPublic: data.is_public,
    userId: data.user_id,
    params: data.params,
  };
}

/**
 * Update the signed-in user's pack. A public pack owned by someone else
 * becomes a new row, because row-level security blocks the update.
 */
export async function writeCardPreset(input: {
  userId: string;
  packId: string | null;
  name: string;
  isPublic: boolean;
  params: PackParams;
}): Promise<{ id: string; copied: boolean } | { error: string }> {
  const params = packParamsJson(input.params);

  if (input.packId) {
    const updated = await supabase
      .from("card_presets")
      .update({ name: input.name, params, is_public: input.isPublic })
      .eq("id", input.packId)
      .eq("user_id", input.userId)
      .select("id");
    if (updated.error) return { error: updated.error.message };
    const row = updated.data?.[0];
    if (row) return { id: row.id, copied: false };
  }

  const inserted = await supabase
    .from("card_presets")
    .insert({
      user_id: input.userId,
      name: input.name,
      params,
      is_public: input.isPublic,
    })
    .select("id")
    .single();
  if (inserted.error || !inserted.data) {
    return { error: inserted.error?.message ?? "Could not save the pack" };
  }
  return { id: inserted.data.id, copied: input.packId !== null };
}
