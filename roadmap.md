# Sigil — roadmap

A lean task list, not a log. Check before reporting work complete.

## Done
- Obsidian Ledger design system: tokens + fonts in `src/styles.css` (obsidian surfaces, ember accent, Fraunces / Hanken Grotesk / JetBrains Mono, breathing glow)
- `packages/core`: `brand.ts` (one-file rename), `color.ts` (WCAG `contrastRatio`), six builtin themes in `themes/builtin/`
- Studio home (`/`): split-screen — control rail + live 3×3 nine-card preview + community theme gallery + copy-Markdown CTA

## Open
- Edge render API (animated SVG card generation) — needs a Workers target; not wired yet
- GitHub Action that commits static SVG backups to the user's repo
- Lovable Cloud / Supabase: cached profile data, themes table, Sign in with GitHub (own API quota + private contributions)
- Public JSON API
- CI theme validator using `contrastRatio()` (4.5:1 text, 3:1 accent)
