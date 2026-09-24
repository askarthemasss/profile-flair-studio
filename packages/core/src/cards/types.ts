import { z } from "zod";
import type { CardSnapshot } from "../snapshot";
import type { CardTheme } from "../themes/types";

const flag = z.enum(["0", "1"]).transform((value) => value === "1");

/** Parameters every card accepts. */
export const CommonParamsSchema = z.object({
  theme: z.string().optional(),
  animate: flag.default("1"),
  hide_border: flag.default("0"),
  radius: z.coerce.number().int().min(0).max(24).default(12),
});

export type CommonParams = z.infer<typeof CommonParamsSchema>;

export interface RenderContext<P> {
  snapshot: CardSnapshot;
  theme: CardTheme;
  /** ISO timestamp. Renderers never read the clock. */
  now: string;
  animate: boolean;
  params: P & CommonParams;
}

/** What a renderer returns; `svg()` wraps it. */
export interface CardOutput {
  title: string;
  desc: string;
  body: string;
  defs?: string;
  css?: string;
  keyframes?: string;
}

export type CardRenderer<P = Record<string, unknown>> = (ctx: RenderContext<P>) => CardOutput;

export interface CardModule<S extends z.AnyZodObject = z.AnyZodObject> {
  id: string;
  size: { w: number; h: number };
  paramsSchema: S;
  render: CardRenderer<z.infer<S>>;
  meta: { name: string; description: string; defaults: Record<string, string> };
}

export function defineCard<S extends z.AnyZodObject>(card: CardModule<S>): CardModule<S> {
  return card;
}

export { flag };
