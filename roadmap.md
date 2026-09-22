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

## Open

- Sign in with GitHub (own API quota + private contributions) — Cloud doesn't support GitHub OAuth natively; needs BYO Supabase or workaround
