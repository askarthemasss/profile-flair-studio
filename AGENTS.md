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

- GitHub data is fetched via GraphQL only (apps/render/src/pipeline); REST path is a no-token fallback. Why: the 5,000-point/hour budget is the core constraint.

## Local development

- Use Bun. CI runs `bun install --frozen-lockfile` and `bun run check` (theme contrast, SVG size, and `packages/core` tests). `bun.lock` is the lockfile.
- `bun run dev` serves the studio at http://localhost:8080. `@lovable.dev/vite-tanstack-config` pins that port.
- The committed `.env` has the public Supabase URL and publishable key the app needs to boot. `GITHUB_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` are optional. Public card routes still render from GitHub without a token, and the studio draws the built-in demo profile in the browser.
