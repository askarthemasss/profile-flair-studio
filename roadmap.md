# Sigil — roadmap

A lean task list, not a log. Check before reporting work complete.

## Done

- Obsidian Ledger design system: tokens + fonts in `apps/studio/src/styles/` (obsidian surfaces, ember accent, Fraunces / Hanken Grotesk / JetBrains Mono)
- `packages/core`: brand, WCAG color helpers, theme schema/resolver, nine card renderers, stats, GitHub queries + normalizer
- Studio pages: landing, live studio, theme gallery, docs, preset library, status
- Edge render API on Cloudflare Workers: `/c/:kind/:user`, `/snapshot/:user`, `/themes`, `/health`, Supabase snapshot cache, cron refresh
- Supabase migration for the snapshot cache
- CI: typecheck, lint, tests, builds, WCAG theme validation, SVG size budget
- Per-card param schemas wired into the render route, so defaults, numeric coercion, and `hide` lists apply (`check:svg` renders with defaults)
- Contribution years populated in the refresh pipeline: the current year plus the two most recent, converted to `days[]` for heatmap, skyline, and activity
- GitHub Action renders the real cards with `@sigil/core`, defaults to the nine valid kinds, and ships a committed bundle (`packages/action/dist/index.js`)
- Stale-while-revalidate: stale snapshots are served immediately, refreshed via `waitUntil`, and deduped per login
- Six builtin themes (obsidian, monolith, verdigris, paper, tidepool, sandstone), all passing WCAG AA validation
- `theme.font` drives the SVG font stack and `hide_border=1` removes the card outline
- Versioned JSON API: `/v1` aliases for every route, `X-Sigil-Api-Version`, `schema`-versioned snapshots, and a docs section
- Studio no longer defaults to the dead `sigil.dev` host: without `VITE_RENDER_API_URL` it stays on demo data and the export panel says so

## Open

- Deploy the render Worker and point the studio at it: needs `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, Worker secrets (`GITHUB_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), and `VITE_RENDER_API_URL`; steps in `apps/render/README.md`
