# Sigil — roadmap

A lean task list, not a log. Check before reporting work complete.

## Done

- Obsidian Ledger design system: tokens + fonts in `src/styles.css` (obsidian surfaces, ember accent, Fraunces / Hanken Grotesk / JetBrains Mono, breathing glow)
- `packages/core`: `brand.ts` (one-file rename), `color.ts` (WCAG `contrastRatio`), six builtin themes in `themes/builtin/`
- Studio home (`/`): split-screen — control rail + live 3×3 nine-card preview + community theme gallery + copy-Markdown CTA

## Done

- Lovable Cloud enabled: 7 tables (profiles, github_tokens, snapshots, contribution_years,
  card_presets, theme_votes, optouts) with RLS + GRANTs, set_updated_at trigger, handle_new_user
  signup trigger (profile + default preset), claim_stale_snapshots cron helper, theme_vote_counts
  public function. Seed script `seed:demo` fetches octocat snapshot for local dev.

## Done

- Render API: `GET /c/:kind/:username?theme=&animate=` returns an animated SVG.
  Same nine kinds as the studio. Public GitHub data, in-memory cache, and the
  `snapshots` table when a service-role key is present. A card stays a card
  when GitHub is quiet.
- Public JSON: `GET /api/v1/users/:username` and `GET /api/v1/themes`
- CI theme validator: `bun run check` (text/muted ≥ 4.5:1, accent/gold ≥ 3:1)
- GitHub Action in `action/` commits static SVG backups

## Done

- Site + workspace: marketing shell (1120px) for `/`, `/themes`, `/themes/$id`, `/docs`,
  `/docs/$card`, `/status`; full-viewport workspace for `/studio` and `/dashboard`
  (320px controls · dotted canvas · 340px export; export becomes a bottom sheet below 1024px;
  three tabs below 768px). Session-aware header, Cmd/Ctrl+K palette, per-page error fallbacks.
- Google sign-in (Lovable Cloud managed): `/auth/callback`, `_authenticated` gate,
  `/dashboard` with saved packs, connection summary, and confirm dialogs.

## Done

- M1 SVG toolkit (`packages/core/src/svg/*`): `esc`, `svg()` document wrapper (scoped theme
  variables, embedded subset font), `wrapText`, `formatNumber`, `relativeTime`, `monotonePath`,
  CSS-only animations; card registry + `renderCard` with `CommonParamsSchema`.
- M2 card catalog: nine cards in `packages/core/src/cards/<id>.ts` (`stats` renamed to `overview`,
  old URLs still work), golden tests in `packages/core/test/cards`, size budgets in
  `scripts/check-svg-size.ts` (all in `bun run check`).

## Open

- M4–M9: the uploaded brief stops after M2 — waiting on the rest of the spec from the user

## Done

- M3 data pipeline: GraphQL-only snapshot (`packages/core/src/github/*`), stats (`packages/core/src/stats/*`: rank, streak, languages, achievements), refresh + persistence (`apps/render/src/pipeline/*`). Past years cached 30 days; cost logged per query.
- Studio writes `card_presets` (name, theme, cards, animation, static backup, public flag). `?pack=` restores a pack; dashboard Open uses that link. A public pack you do not own saves as a copy. `anon` can select the table; row-level security still hides private packs.
- Theme pull requests: `/themes` lists the file to add, the registry line, and the contrast bars `bun run check` already enforces.
