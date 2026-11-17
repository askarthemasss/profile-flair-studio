<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Design and UI work

- Read [`DESIGN.md`](DESIGN.md) before changing a page, component, token, or
  piece of UI copy. It is the source of truth for the Drawn Notebook language.
  It is intentionally on-demand, not auto-loaded.
- Run the `ui-review` skill on the changed files for a static pass. Fix P0 and
  P1 findings before opening a pull request.
- Run the `browser-review` skill for rendered checks: `/`, `/studio`, `/themes`,
  `/docs` in light and dark, at 1440 and 390, with reduced motion.
- Keep the public surface to those four routes. Do not add placeholder pages.
- Project skills live in `.opencode/skills/`. Keep them to `ui-review` and
  `browser-review`; add another only when it has a distinct, recurring job.
- Browser reviews use the repository-local Playwright CLI:
  `pnpm exec playwright cli`. See `.opencode/skills/browser-review/SKILL.md`.
- Provenance and licenses for the design references are recorded in
  [`docs/design/references.md`](docs/design/references.md).
