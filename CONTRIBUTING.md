# Contributing to Sigil

Thanks for helping. Sigil is a small monorepo with a clear split between the shared card engine, the studio, the edge API, and the GitHub Action. This guide covers the setup, the conventions, and the checks a pull request needs to pass.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report a bug** with the bug report template. Include the route, browser, and exact steps.
- **Suggest a feature** with the feature request template. Explain the user problem, not only the solution.
- **Contribute a theme** as a JSON file in [`themes/community/`](themes/community/). Themes must pass the schema and WCAG AA contrast validation.
- **Improve the docs** in the README, `apps/render/README.md`, `packages/action/README.md`, or the in-app docs page.
- **Write code** for the studio, core renderers, Worker, or Action. Issues labeled **good first issue** and **help wanted** are a good starting point.
- **Review pull requests** and leave constructive, specific feedback.

For questions and open-ended ideas, use [GitHub Discussions](https://github.com/askarthemasss/profile-flair-studio/discussions) instead of an issue.

## Development setup

### Prerequisites

- **Node.js 20.19+** (CI uses Node 20; Node 22 LTS also works)
- **pnpm 9+** — run `corepack enable` once, or install pnpm from [pnpm.io](https://pnpm.io/installation)
- Git

### First run

```bash
git clone https://github.com/<your-fork>/profile-flair-studio.git
cd profile-flair-studio
corepack enable
pnpm install
pnpm dev
```

The studio runs at [http://localhost:5173](http://localhost:5173). It starts with sample data; type a username and press **Load** to fetch live public data.

### Optional: run the render Worker locally

The studio works without a Worker, but the Worker is needed to test server-side rendering, caching, and live embed URLs.

```bash
cp apps/render/.dev.vars.example apps/render/.dev.vars
# Add a GitHub token to apps/render/.dev.vars
pnpm --filter @sigil/render dev
```

Then point the studio at it:

```bash
cp apps/studio/.env.example apps/studio/.env
# Set VITE_RENDER_API_URL=http://localhost:8787
pnpm dev
```

`.env` and `.dev.vars` files are git-ignored. Never commit real tokens. See [`apps/render/README.md`](apps/render/README.md) for the full Worker setup.

## Repository map

| Path                | Responsibility                                                               |
| ------------------- | ---------------------------------------------------------------------------- |
| `apps/studio`       | React SPA: landing, studio, themes, docs, presets, status, theme toggle      |
| `apps/render`       | Hono + Cloudflare Worker API: cards, snapshots, themes, health, edge cache   |
| `packages/core`     | Shared types, Zod schemas, themes, stats, GitHub queries, nine SVG renderers |
| `packages/action`   | GitHub Action that writes static SVG cards                                   |
| `themes/community`  | Community theme JSON files                                                   |
| `scripts`           | Theme validation and SVG size-budget checks                                  |
| `.github/workflows` | CI and conditional deployment                                                |

## Branch and commit conventions

- Branch from `main`. Use a descriptive prefix:
  - `feat/...` for a new capability
  - `fix/...` for a bug fix
  - `docs/...` for documentation
  - `chore/...` for tooling or maintenance
  - `refactor/...` for behavior-preserving changes
- Keep pull requests focused. One concern per PR is easier to review and revert.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit subjects, for example:
  - `feat(studio): add compact language layout`
  - `fix(render): keep stale snapshots out of the browser cache`
  - `docs: document the Worker deployment flow`
- Do not rewrite published history on `main`. The repository is connected to Lovable, and force-pushes, rebases, or squashes of already-pushed commits can break that sync. Use a branch and a merge commit.

## What to change, and where

### A card renderer or parameter

1. Update the schema in `packages/core/src/params.ts` and, if needed, the shared types in `packages/core/src/types.ts`.
2. Update the renderer in `packages/core/src/cards/`.
3. Wire the parameter into the studio controls in `apps/studio/src/components/studio/ControlPanel.tsx` when it should be user-facing.
4. Add or update tests in `packages/core/src/__tests__/`.
5. Run `pnpm check:svg` and keep every card under the 45 KB budget.
6. Update the public docs page if the parameter is part of the embed API.

### A theme

1. Add a JSON file to `themes/community/` using the shape in [`themes/community/README.md`](themes/community/README.md).
2. Use a unique lowercase `id` (2–40 characters, letters, digits, and hyphens).
3. Make sure text contrast is at least 4.5:1 and accent contrast is at least 3:1 against the background.
4. Run `pnpm validate:themes`.
5. Include a screenshot or a short description in the pull request.

### The Worker

- Keep it stateless. Do not add a database, cron job, or stored user token.
- Preserve the cache contract: fresh snapshots for 4 hours, stale-while-revalidate, and `no-store` on stale responses.
- Keep the `workers.dev` path working when the Cache API is a no-op.
- Add tests where the behavior is testable without a live Cloudflare environment.

### The studio

- Keep the Drawn Notebook design language: paper surfaces, ink typography, gold/terracotta accents, and restrained motion.
- Both light and dark modes must work. Use the existing theme tokens instead of hard-coded colors.
- Preserve keyboard access, focus-visible styles, dialog focus trapping, and reduced-motion behavior.
- Do not add a runtime dependency without a clear reason; the studio bundle is already large.

### The Action

- The Action runs from the committed bundle at `packages/action/dist/index.js`. Rebuild it with `pnpm --filter @sigil/action build` and commit the result.
- Keep the inputs and outputs in `packages/action/action.yml` in sync with `packages/action/src/main.ts`.
- The Action must not depend on a Sigil server.

## Checks before opening a pull request

Run the same checks as CI from the repository root:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm validate:themes
pnpm check:svg
```

For UI changes, also verify:

- The route works in light and dark mode.
- The layout has no horizontal overflow at 390 px.
- Keyboard navigation and focus states still work.
- Reduced-motion preferences do not hide content.
- The browser console has no new errors.

## Pull request process

1. Open the PR against `main` and fill in the template.
2. Link the issue it resolves, if there is one.
3. Describe what changed, why, and how you verified it.
4. Include screenshots or a short recording for visual changes.
5. Keep the PR mergeable; resolve review comments or explain why a suggestion does not apply.
6. A maintainer will merge with a merge commit once CI is green and the review is resolved.

Small, focused PRs with a clear verification section move fastest.

## Reporting bugs and security issues

- Use the [bug report template](https://github.com/askarthemasss/profile-flair-studio/issues/new?template=bug_report.yml) for reproducible bugs.
- Do **not** open a public issue for a security vulnerability. Follow [`SECURITY.md`](SECURITY.md) instead.
- For a broken deploy or a leaked secret, contact the maintainer privately first.

## License

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE).
