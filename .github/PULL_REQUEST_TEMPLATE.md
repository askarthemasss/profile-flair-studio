## Summary

<!-- What changed, and why? Keep it short but specific. -->

## Related issue

<!-- Closes #123, or "none". -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Theme
- [ ] Refactor or maintenance
- [ ] CI or deployment

## How I tested

<!-- List the commands you ran and the behavior you checked. -->

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm validate:themes` (if a theme changed)
- [ ] `pnpm check:svg` (if a card renderer or parameter changed)

## UI review (if the studio changed)

- [ ] I read `DESIGN.md` and used the existing tokens and component classes.
- [ ] `ui-review` reports no P0 or P1 findings.
- [ ] `browser-review` passes for the routes I changed: light/dark, 1440/390.
- [ ] No horizontal overflow at 390 px and no new console errors.
- [ ] Keyboard navigation, focus-visible states, and reduced motion still work.
- [ ] Destructive actions have confirmation or undo.
- [ ] Copy, load, and validation feedback is announced to assistive technology.
- [ ] No new placeholder route, fake feature, or unsupported claim.

## Screenshots or recordings

<!-- For visual changes, include before/after images or a short recording. -->

## Checklist

- [ ] I read `CONTRIBUTING.md`.
- [ ] The change is focused on one concern.
- [ ] I updated the docs where behavior or configuration changed.
- [ ] I did not commit real tokens, `.env` files, or `.dev.vars` files.
- [ ] I did not force-push or rewrite published history.
- [ ] The PR is ready for review (not a draft).
