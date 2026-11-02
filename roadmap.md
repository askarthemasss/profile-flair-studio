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
- Per-card param schemas wired into the render route, so defaults, numeric coercion, and `hide` lists apply (`check:svg` renders with defaults)
- Contribution years populated in the refresh pipeline: the current year plus the two most recent, converted to `days[]` for heatmap, skyline, and activity
- GitHub Action renders the real cards with `@sigil/core`, defaults to the nine valid kinds, and ships a committed bundle (`packages/action/dist/index.js`)

## Open

- Implement stale-while-revalidate so stale snapshots are served instantly instead of an error card
- Add the remaining builtin themes (`paper`, `tidepool`, `sandstone`) or trim the gallery
- Public JSON API documentation and versioning
- Implement or remove unused theme fields (`font`, `effects`) and `hide_border`
