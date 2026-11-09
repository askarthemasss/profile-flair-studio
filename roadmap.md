# Sigil — roadmap

A lean task list, not a changelog. Update it when work lands or priorities change.

## Shipped

- **Drawn Notebook design system** — warm paper surfaces, ink typography (Cormorant Garamond + Inter), gold/terracotta accents, notebook cards, grain overlay, drawn rules, and scroll reveals across every studio route.
- **Light and dark modes** — flash-free prepaint theme script, `data-theme`, `localStorage` persistence, system-preference fallback, and a sun/moon toggle.
- **Studio pages** — landing, live studio, theme gallery, docs, preset library, and status.
- **`packages/core`** — brand constants, WCAG color helpers, theme schema/resolver, nine card renderers, stats, GitHub queries, and snapshot normalizer.
- **Edge render API** — `/c/:kind/:user`, `/snapshot/:user`, `/themes`, and `/health`, with `/v1` aliases, `X-Sigil-Api-Version`, and CORS headers.
- **Stateless caching** — no database; normalized snapshots live in the Cloudflare Cache API plus an in-isolate memory layer, with 4-hour freshness and stale-while-revalidate.
- **Per-card parameters** — schemas wired into the render route and the studio previews, so defaults, numeric coercion, and `hide` lists behave the same in both places.
- **Six built-in themes** — obsidian, monolith, verdigris, paper, tidepool, and sandstone, all passing WCAG AA text/accent contrast validation.
- **GitHub Action** — renders the real cards with `@sigil/core` using the user's own token and ships a committed esbuild bundle.
- **Studio data loading** — explicit **Load** action; deployed Worker when `VITE_RENDER_API_URL` is set, otherwise a browser-side public GitHub fetch with not-found and rate-limit states. Typing never calls GitHub, repeated loads bypass caches, and superseded requests are aborted.
- **CI** — typecheck, studio lint, core tests, builds, WCAG theme validation, and the 45 KB SVG size budget.

## Next

- **Deploy the render Worker** and point the studio at it. This is the main external blocker. It needs:
  - `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets.
  - A `GITHUB_TOKEN` Worker secret.
  - `VITE_RENDER_API_URL` in the Vercel project.
  - Steps: [`apps/render/README.md`](apps/render/README.md).
- **Publish the GitHub Action** to the Marketplace once the repository is public and the Action metadata is final.
- **Community theme pipeline** — replace the validation-only submit dialog with a real flow: generate a theme JSON file, validate contrast locally, and open a pull request (or a prefilled issue) from the studio.
- **Persistent theme votes** — if a backend is ever added, keep it small and optional; the current votes are local-only by design.
- **More card-level tests** — add renderer snapshot tests for parameter combinations that are currently covered only by the size-budget pass.

## Later

- Additional card kinds that fit the notebook design language.
- A static export command for the studio (generate a full pack without the Action).
- Optional custom-domain setup guidance for self-hosters.
- Documentation translations once the English docs are stable.

## Not planned

- User accounts, OAuth, or private contribution data.
- A database for profiles or snapshots.
- PNG or raster endpoints.
- Year-in-review pages, coding clocks, or AI-generated cards.
- Tracking or analytics inside the studio.

## Working state

- The studio is live on Vercel.
- The render Worker is implemented but not deployed in the hosted setup.
- Without `VITE_RENDER_API_URL`, the studio fetches public GitHub data in the browser and shows sample data until the user presses **Load**.
- Presets and theme votes are `localStorage`-only.
- Theme submission is validation-only; community themes are accepted via pull request.
- There is no database.
