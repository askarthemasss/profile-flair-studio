# Security policy

## Supported versions

Sigil is developed on `main`. Security fixes land on `main` and are deployed from there; older commits and forks are not supported.

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Use GitHub's private vulnerability reporting:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include the details below.

If private reporting is unavailable, contact the maintainer [@askarthemasss](https://github.com/askarthemasss) through GitHub and ask for a private channel. Do not include exploit details in a public issue, discussion, or pull request.

### What to include

- A short description of the issue and the affected component (`apps/studio`, `apps/render`, `packages/core`, `packages/action`, or a workflow).
- The commit, branch, or deployment where you observed it.
- Reproduction steps or a proof of concept.
- The impact you believe it has, and any conditions required to exploit it.
- Whether the issue is already public.

### What to expect

- An acknowledgement as soon as practical, usually within a few days.
- A best-effort assessment and remediation plan.
- Credit in the fix or release notes if you want it.

Please give the maintainer reasonable time to fix the issue before public disclosure.

## Security model

Understanding the intended design makes reports easier to assess:

- **No database.** The render Worker is stateless. Snapshots live in Cloudflare's cache and an in-isolate memory map.
- **No user accounts or OAuth.** Sigil reads public GitHub data only. It does not store user tokens.
- **Server-side GitHub token.** The Worker's `GITHUB_TOKEN` (or `GITHUB_TOKEN_POOL`) is a Cloudflare secret. It must never be exposed to the studio, committed to the repository, or placed in a `VITE_*` variable.
- **Public build-time configuration.** `VITE_RENDER_API_URL` is inlined into the browser bundle and is not secret. Anything prefixed with `VITE_` must be safe to publish.
- **SVG output.** Card renderers escape user-controlled strings before interpolation. A rendering bypass that enables script execution or external resource loading is in scope.
- **Theme JSON.** Themes are data validated by a Zod schema. A theme that can inject markup, escape the palette fields, or bypass contrast validation is in scope.
- **GitHub Action.** The Action runs with the workflow's `GITHUB_TOKEN` and writes SVG files. A path traversal, command injection, or unexpected file write is in scope.
- **Dependencies.** Report a vulnerable dependency if it is reachable from a shipped component. Include the dependency path and the affected version.

## Out of scope

- Rate limiting or quota exhaustion on GitHub's public API.
- Findings that require a compromised maintainer account, a compromised GitHub Actions runner, or a compromised Cloudflare account.
- Missing security headers on a local development server.
- Social engineering, spam, or reports that only contain a scanner output without a concrete impact.
- The historical Supabase publishable key in the git history. That project has been deleted, the key was publishable by design, and no service-role key was ever committed. If you believe otherwise, report it privately with evidence.

## Safe harbor

Good-faith security research is welcome. Do not access other users' data, disrupt the hosted service, or run destructive tests. If you are unsure whether a test is safe, ask first.
