---
name: browser-review
description: Verify Sigil's four working routes in a real browser with Playwright CLI. Use for layout, light/dark, 1440/390, keyboard, reduced motion, console errors, and visual evidence before a UI pull request.
---

# Sigil browser review

A rendered pass over the four working routes. Use it after `ui-review` and
before opening a UI pull request.

## Read first

1. `DESIGN.md`, especially sections 5 (layout), 7 (motion), 10 (accessibility),
   and 11 (dark mode).
2. `.opencode/skills/browser-review/references/route-matrix.md`.

## Preconditions

- Node 20+ and `pnpm install` are done.
- Playwright is installed locally as a dev dependency and the Chromium build is
  present:

  ```bash
  pnpm exec playwright install chromium
  ```

- The studio is running:

  ```bash
  pnpm dev
  ```

  Wait for `http://localhost:5173` before opening the browser. In an agent
  session, start it in the background and poll the URL once; do not poll in a
  loop.

## CLI resolution

Use the repository-local Playwright CLI:

```bash
pnpm exec playwright cli --help
```

Do not run `npx @playwright/cli@latest` or install a global CLI. The repo pins
Playwright so reviews are reproducible. If `pnpm exec playwright cli` is not
available, stop and report the setup problem instead of silently using a
different browser tool.

The CLI reads `.playwright/cli.config.json` automatically. It sets Chromium,
1440×900, an isolated profile, a 5s action timeout, and `.playwright-cli/` as
the output directory. That directory is git-ignored.

## Procedure

1. **Open a named session** so this review does not collide with another agent:

   ```bash
   pnpm exec playwright cli -s=sigil-review open http://localhost:5173
   ```

2. **Set the viewport and mode.** The app persists the UI mode in
   `localStorage` under `color-scheme`; the prepaint script applies it before
   first paint.

   ```bash
   pnpm exec playwright cli -s=sigil-review resize 1440 900
   pnpm exec playwright cli -s=sigil-review localstorage-set color-scheme light
   pnpm exec playwright cli -s=sigil-review reload
   ```

3. **Walk the matrix.** For each route, in light and dark, at 1440 and 390:

   ```bash
   pnpm exec playwright cli -s=sigil-review goto http://localhost:5173/studio
   pnpm exec playwright cli -s=sigil-review snapshot --depth=4
   pnpm exec playwright cli -s=sigil-review console error
   pnpm exec playwright cli -s=sigil-review screenshot --filename=studio-light-1440.png
   pnpm exec playwright cli -s=sigil-review --raw eval "document.documentElement.scrollWidth > document.documentElement.clientWidth"
   ```

   A `true` result means horizontal overflow. Fix it before continuing.

4. **Check the dark pass.** Toggle through the UI once to prove the control works,
   then use storage for the remaining routes:

   ```bash
   pnpm exec playwright cli -s=sigil-review localstorage-set color-scheme dark
   pnpm exec playwright cli -s=sigil-review reload
   ```

   Confirm `color-scheme` and `<meta name="theme-color">` match the page.

5. **Check the 390px pass.** Resize, reload, and repeat the overflow and console
   checks. Confirm the mobile nav scrolls instead of wrapping and the theme
   toggle collapses to its icon.

6. **Check keyboard access.** On `/studio` and `/themes`, press Tab through the
   first 15–20 stops. Confirm the skip link appears first, focus is visible, the
   order is logical, and the sticky header does not cover the focused control.
   Press Enter and Space on the pack rows, segmented controls, and action
   buttons. A control that cannot be reached is a P1.

7. **Check reduced motion.** On `/` and `/studio`:

   ```bash
   pnpm exec playwright cli -s=sigil-review set-reduced-motion reduce
   pnpm exec playwright cli -s=sigil-review reload
   ```

   Confirm all hero and reveal content is visible immediately and no transition
   runs.

8. **Check the real flows.**
   - `/studio`: change the username draft, press **Load**, confirm the loading
     state is announced and the preview updates or shows a clear error. Change a
     card parameter, reorder a card, remove a card, reset the pack, and copy a
     snippet.
   - `/themes`: search, change the mode filter, apply a theme, and confirm the
     studio opens with that theme.
   - `/docs`: confirm code blocks and tables scroll at 390px without widening
     the page.
   - `/`: confirm the card previews render and both primary actions route
     correctly.

9. **Close the session.**

   ```bash
   pnpm exec playwright cli -s=sigil-review close
   ```

## Route matrix

| Route     | Light 1440 | Dark 1440 | Light 390 | Dark 390 | Extra checks                                     |
| --------- | :--------: | :-------: | :-------: | :------: | ------------------------------------------------ |
| `/`       |     ✓      |     ✓     |     ✓     |    ✓     | Hero, reveals, both CTAs, reduced motion         |
| `/studio` |     ✓      |     ✓     |     ✓     |    ✓     | Load, parameters, reorder, reset, copy, keyboard |
| `/themes` |     ✓      |     ✓     |     ✓     |    ✓     | Search, filter, apply, keyboard                  |
| `/docs`   |     ✓      |     ✓     |     ✓     |    ✓     | Tables and code overflow                         |

Every cell also requires: no console errors, no horizontal overflow, no
unlabelled controls, and no invisible content.

## What to report

Report only defects and meaningful risks. For each finding:

```text
P1 /studio 390 dark — pack row cannot be reached by keyboard.
Evidence: 12 Tab presses stop at the select; the row never receives focus.
Fix: make the row label a <button> for selection and keep the move/remove
buttons as siblings; do not nest buttons.
```

Include the screenshot filename for visual findings. End with a verdict:
**pass**, **pass with P2s**, or **blocked by P0/P1**.

## Guardrails

- Do not review the hosted production site as a substitute for local changes.
  Use `https://profile-flair-studio.vercel.app` only to confirm a deploy.
- Do not commit `.playwright-cli/` screenshots, traces, or videos. Attach them to
  a PR only when they are useful evidence.
- Do not use the browser to test features that are not wired up. The hosted
  render Worker is not deployed; card URLs may be placeholders by design.
- Do not change the UI while reviewing. Report first; fix in a separate pass.
