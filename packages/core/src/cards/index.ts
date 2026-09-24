import type { z } from "zod";
import type { CardKind } from "../profile";
import type { CardSnapshot } from "../snapshot";
import type { CardTheme } from "../themes/types";
import { svg } from "../svg/document";
import { achievements } from "./achievements";
import { activity } from "./activity";
import { banner } from "./banner";
import { heatmap } from "./heatmap";
import { languages } from "./languages";
import { overview } from "./overview";
import { repo } from "./repo";
import { skyline } from "./skyline";
import { streak } from "./streak";
import { CommonParamsSchema, type CardModule } from "./types";

export { CommonParamsSchema, defineCard } from "./types";
export type { CardModule, CardOutput, CardRenderer, CommonParams, RenderContext } from "./types";

/** Every card plugs in here. Order is the catalog order. */
export const CARD_REGISTRY: Record<CardKind, CardModule> = {
  overview,
  streak,
  languages,
  heatmap,
  skyline,
  activity,
  achievements,
  repo,
  banner,
} as Record<CardKind, CardModule>;

export interface RenderCardInput {
  snapshot: CardSnapshot;
  theme: CardTheme;
  /** ISO timestamp; renderers never read the clock. */
  now: string;
  /** Raw query parameters. Invalid values fall back to defaults, never an error card. */
  params?: Record<string, string | undefined>;
  /** Overrides the `animate` param when set. */
  animate?: boolean;
}

/** Parse leniently: drop each invalid key and keep the rest. */
function parseParams(schema: z.AnyZodObject, raw: Record<string, string | undefined>): Record<string, unknown> {
  const input: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value !== undefined && value !== "") input[key] = value;
  }
  for (let attempt = 0; attempt < 8; attempt++) {
    const result = schema.safeParse(input);
    if (result.success) return result.data as Record<string, unknown>;
    for (const issue of result.error.issues) delete input[String(issue.path[0])];
  }
  return schema.parse({}) as Record<string, unknown>;
}

export function renderCard(id: CardKind, input: RenderCardInput): string {
  const card = CARD_REGISTRY[id];
  const params = parseParams(CommonParamsSchema.extend(card.paramsSchema.shape), input.params ?? {});
  const animate = input.animate ?? params["animate"] === true;
  const out = card.render({
    snapshot: input.snapshot,
    theme: input.theme,
    now: input.now,
    animate,
    params: params as never,
  });
  return svg({
    w: card.size.w,
    h: card.size.h,
    theme: input.theme,
    animate,
    border: params["hide_border"] !== true,
    radius: typeof params["radius"] === "number" ? params["radius"] : 12,
    ...out,
  });
}
