# Sigil — roadmap

A lean task list, not a log. Check before reporting work complete.

## Done

- Obsidian Ledger design system: tokens + fonts in `apps/studio/src/styles/` (obsidian surfaces, ember accent, Fraunces / Hanken Grotesk / JetBrains Mono)
- `packages/core`: brand, WCAG color helpers, theme schema/resolver, nine card renderers, stats, GitHub queries + normalizer
- Studio pages: landing, live studio, theme gallery, docs, preset library, status
- Edge render API on Cloudflare Workers: `/c/:kind/:user`, `/snapshot/:user`, `/themes`, `/health`, Supabase snapshot cache, cron refresh
- Supabase migration for the snapshot cache
- GitHub Action skeleton (fetch + write files)
- CI: typecheck, lint, tests, builds, WCAG theme validation, SVG size budget

## Open

- GitHub Action: replace placeholder SVG generation with `@sigil/core` renderers, fix the default card list, publish bundled `dist/`
- Wire per-card param schemas into the render route so defaults and validation are correct
- Populate contribution years so heatmap, skyline, and activity cards render real data
- Implement stale-while-revalidate so stale snapshots are served instantly instead of an error card
- Add the remaining builtin themes (`paper`, `tidepool`, `sandstone`) or trim the gallery
- Public JSON API documentation and versioning
- Implement or remove unused theme fields (`font`, `effects`) and `hide_border`
