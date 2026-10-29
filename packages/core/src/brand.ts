/**
 * Single source of truth for the Sigil brand identity.
 *
 * Renaming the product is a one-file change: update this constant and every
 * surface (studio header, <title>, og tags, generated Markdown comment,
 * Action README) picks it up.
 */
export const BRAND = {
  name: "Sigil",
  tagline: "Your developer sigil. Nine living cards for your GitHub profile, one line to install.",
  /** Short label used where the full tagline is too long (nav, footer). */
  shortTagline: "Your developer sigil.",
  license: "MIT",
  /** Base URL used to build live image URLs and the copy-Markdown snippet. */
  baseUrl: "https://sigil.dev",
} as const;

export type Brand = typeof BRAND;
