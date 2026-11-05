# Sigil — roadmap

A lean task list, not a log. Check before reporting work complete.

## Done

- Obsidian Ledger design system: tokens + fonts in `apps/studio/src/styles/` (obsidian surfaces, ember accent, Fraunces / Hanken Grotesk / JetBrains Mono)
- `packages/core`: brand, WCAG color helpers, theme schema/resolver, nine card renderers, stats, GitHub queries + normalizer
- Studio pages: landing, live studio, theme gallery, docs, preset library, status
- Edge render API on Cloudflare Workers: `/c/:kind/:user`, `/snapshot/:user`, `/themes`, `/health`, edge snapshot cache
- CI: typecheck, lint, tests, builds, WCAG theme validation, SVG size budget
- Per-card param schemas wired into the render route, so defaults, numeric coercion, and `hide` lists apply (`check:svg` renders with defaults)
- Contribution years populated in the refresh pipeline: the current year plus the two most recent, converted to `days[]` for heatmap, skyline, and activity
- GitHub Action renders the real cards with `@sigil/core`, defaults to the nine valid kinds, and ships a committed bundle (`packages/action/dist/index.js`)
- Stale-while-revalidate: stale snapshots are served immediately, refreshed via `waitUntil`, and deduped per login
- Six builtin themes (obsidian, monolith, verdigris, paper, tidepool, sandstone), all passing WCAG AA validation
- `theme.font` drives the SVG font stack and `hide_border=1` removes the card outline
- Versioned JSON API: `/v1` aliases for every route, `X-Sigil-Api-Version`, `schema`-versioned snapshots, and a docs section
- Studio no longer defaults to the dead `sigil.dev` host: without `VITE_RENDER_API_URL` it stays on demo data and the export panel says so
- Removed the database: no Supabase client, migrations, env vars, or cron refresh; snapshots live in the per-colo Cloudflare Cache API with an in-isolate fallback for `workers.dev`, where the Cache API is a no-op
- Studio docs, landing preview, and export snippets now derive the Worker origin from `VITE_RENDER_API_URL` (with an obvious placeholder when unset) instead of the unowned `sigil.dev` host; the unused `BRAND.baseUrl` was dropped
- Studio fetches live GitHub profile data when a username is entered: deployed Worker when `VITE_RENDER_API_URL` is set, otherwise browser-side public API calls (unauthenticated), with not-found and rate-limit states shown instead of silently swapping to sample data; card previews now apply the same param schema as the API, so defaults like heatmap `weeks` are honored

## Open

- Deploy the render Worker and point the studio at it: needs `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, Worker secret (`GITHUB_TOKEN`), and `VITE_RENDER_API_URL`; steps in `apps/render/README.md`
