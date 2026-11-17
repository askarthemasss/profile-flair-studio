# UI baseline audit

- **Date:** 2026-11-18
- **Base:** `main` at `4719ecd`, plus the design-quality tooling branch
- **Browser:** Playwright 1.65.1, Chromium 1255, isolated profile
- **Routes:** `/`, `/studio`, `/themes`, `/docs`
- **Viewports:** 1440×900, 390×844, 320×700
- **Themes:** light and dark
- **Motion:** default and `prefers-reduced-motion: reduce`
- **Method:** static review against `DESIGN.md`, the Sigil checklist, and the
  pinned Vercel guidelines; rendered checks with Playwright CLI.

Screenshots and snapshots were kept in the git-ignored `.playwright-cli/`
directory. This document records the findings, not the evidence files.

## Verdict

**No P0.** The four routes load and the core studio flow works. The audit found
**8 P1**, **9 P2**, and **3 P3** issues. The main gaps are keyboard access to
pack selection, unlabelled form controls, destructive actions without
confirmation or undo, unannounced copy feedback, missing toggle state, and a
console error from the snapshot query setup.

## Resolution

All eight P1 findings and all nine P2 findings were fixed on
`fix/ui-audit-p1`. The P3 table-semantics and heading-anchor items were also
fixed; the React Router future-flag warnings remain open and are unrelated to
this pass.

| Finding                                    | Status | Change                                                                                                                  |
| ------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| P1-1 Pack rows are clickable `div`s        | Fixed  | The row label is a real `<button>` with `aria-pressed`; move/remove buttons stay as siblings.                           |
| P1-2 Controls have no programmatic labels  | Fixed  | Every color override and card parameter has a `<label htmlFor>` and a `name`; icon-only controls keep accessible names. |
| P1-3 Reset is immediate                    | Fixed  | Reset opens an inline confirmation, focuses the confirm button, supports Escape, and returns focus to Reset.            |
| P1-4 Copy is unannounced                   | Fixed  | A polite live region announces success and failure; the failure state is visible and the timer is cleared on unmount.   |
| P1-5 Snapshot query console errors         | Fixed  | `queryFn: skipToken` replaces `enabled: false`, keeping Load as the only fetch trigger with no console error.           |
| P1-6 Toggle groups lack state              | Fixed  | Theme, export format, and mode filter buttons expose `aria-pressed`.                                                    |
| P1-7 Mobile export buttons are unnamed     | Fixed  | Each format button has an `aria-label` in addition to its hidden visible label.                                         |
| P1-8 Card removal is immediate             | Fixed  | Removal shows a Sonner toast with Undo; `restoreCard` reinserts the card at its original index.                         |
| P2-1 Theme filters are not in the URL      | Fixed  | `q` and `mode` use `useSearchParams` and survive reload.                                                                |
| P2-2 Gallery skips a heading level         | Fixed  | A visually hidden `<h2>` names the results region.                                                                      |
| P2-3 Three-period ellipses                 | Fixed  | Copy uses `…` throughout.                                                                                               |
| P2-4 “Live preview” over sample data       | Fixed  | Renamed to “Pack preview”.                                                                                              |
| P2-5 Non-clickable card hover              | Fixed  | Removed the interactive class from theme and feature cards.                                                             |
| P2-6 Grip icon implies dragging            | Fixed  | Removed; reordering uses the labelled up/down buttons.                                                                  |
| P2-7 Nav active state is wrong             | Fixed  | Active is an exact path match and exposes `aria-current="page"`.                                                        |
| P2-8 Status chip changes are silent        | Fixed  | The status container is a polite live region.                                                                           |
| P2-9 Theme empty state is vague            | Fixed  | It names the search, explains the filter, and offers Clear Filters.                                                     |
| P3-2 Docs tables lack `scope`              | Fixed  | Header cells use `scope="col"`.                                                                                         |
| P3-3 Heading anchors hide under the header | Fixed  | Headings have `scroll-margin-top: 5rem`.                                                                                |
| P3-1 React Router future flags             | Open   | Warnings only; defer until the router upgrade.                                                                          |

### Re-audit (fix/ui-audit-p1)

- `/`, `/studio`, `/themes`, `/docs` at 1440×900 and 390×844, light and dark:
  no horizontal overflow, no console errors.
- No unlabelled `input`, `select`, or `textarea`; no unnamed buttons.
- Pack rows are reachable by Tab and activate with Space; the focus ring is
  visible on the row button.
- Reset confirmation, Escape-to-cancel, focus return, card undo, copy success,
  copy failure, theme apply, and URL-backed theme filters were exercised in the
  browser.
- Reduced motion still reveals all hero and section content immediately.
- The only console messages left are the two React Router v7 future-flag
  warnings.

## What passed

- All four routes render without a blank screen or route error.
- No horizontal overflow at 1440, 390, or 320 on any route.
- Light and dark mode both apply before first paint. `data-theme`,
  `color-scheme`, and `<meta name="theme-color">` stay in sync.
- The token contrast pairs used for body text, secondary text, accent text, and
  functional state pass WCAG AA. `--light-grey` is below 3:1, but it is only used
  for disabled/quiet decoration.
- The focus ring is visible: 2px solid gold with a 3px offset.
- The skip link is the first focusable element and targets `#main`.
- `prefers-reduced-motion: reduce` forces hero and reveal content to opacity 1
  and disables transitions.
- The theme gallery applies a theme and lands in `/studio` with that theme.
- The export panel generates Markdown, HTML, and raw URLs from the current pack.
- The sample-data, live-data, loading, and error states are visually distinct.
- The mobile header scrolls its nav instead of breaking the layout.
- The theme toggle collapses to an icon at 390 and keeps its accessible name.

## P1 — fix before the next UI release

### 1. Pack rows are clickable `div`s

`apps/studio/src/components/studio/PackList.tsx:58`

The row that selects a card is a `div` with `onClick`. It is not focusable and
does not respond to Enter or Space. The accessibility tree exposes it as a
generic with a pointer cursor, and the Tab order goes from the "Add Card" select
straight to the move buttons.

**Fix:** make the row label a real `<button type="button">` with
`aria-pressed={isSelected}`, and keep the move/remove buttons as siblings. Do
not nest buttons.

### 2. Color overrides and card parameters have no programmatic labels

`apps/studio/src/components/studio/ControlPanel.tsx:139-159` and `:172-283`

The accent and background inputs use a `<span>` as a visual label. Their
`labels` collection is empty and their accessible name falls back to the
placeholder (`#B87A5A`, `#141210`). The selected-card parameter selects and
inputs have the same problem; the first select has no accessible name at all.

**Fix:** use `<label htmlFor={...}>` with stable ids, or `aria-label` where a
visible label is already adjacent. Add `name` attributes while there.

### 3. Reset is immediate and persisted

`apps/studio/src/components/studio/ControlPanel.tsx:37-42` and `:55-62`

One click clears the cards, theme, overrides, export format, and handle. The
state is persisted, so a reload does not recover it. There is no confirmation or
undo.

**Fix:** show an inline confirmation before resetting, or provide an undo
window. Keep the confirmation keyboard reachable.

### 4. Copy success and failure are not announced

`apps/studio/src/components/studio/ExportPanel.tsx:55-63` and `:83-89`

The button changes to "Copied!" for two seconds, but there is no live region.
The clipboard failure path is an empty `catch`, so a failed copy looks like
nothing happened.

**Fix:** add a polite status message, handle the failure state, and clear the
reset timer on unmount.

### 5. Snapshot query logs two console errors on `/studio`

`apps/studio/src/hooks/useSnapshot.ts:27-37`

The query is created with `enabled: false` but no `queryFn`. TanStack Query logs
`No queryFn was passed as an option` twice on mount. The page still shows sample
data, but the console is not clean.

**Fix:** use `queryFn: skipToken` for the explicit-fetch observer, or provide a
query function. Keep the "Load is the only fetch trigger" behavior.

### 6. Toggle groups do not expose their selected state

`apps/studio/src/components/studio/ControlPanel.tsx:115-130`,
`apps/studio/src/components/studio/ExportPanel.tsx:93-104`,
`apps/studio/src/components/themes/ThemeGrid.tsx:48-60`

The active card theme, export format, and theme-mode filter are styled with
`data-active` or a conditional class, but none of the buttons expose
`aria-pressed`. A screen reader cannot tell which option is selected.

**Fix:** add `aria-pressed={active}` to each toggle button. Keep the visual
state.

### 7. Export format buttons lose their names at mobile widths

`apps/studio/src/components/studio/ExportPanel.tsx:102`

The visible label is `hidden sm:inline`, so at 390 the format buttons contain
only an icon. The icon is decorative and the button has no `aria-label`, leaving
three unnamed buttons in the export panel.

**Fix:** add `aria-label={label}` to each format button, or use a visually
hidden label instead of `display: none`.

### 8. Card removal is immediate and persisted

`apps/studio/src/components/studio/PackList.tsx:96-106`

Removing a card writes the new pack to `localStorage` immediately. There is no
confirmation and no undo.

**Fix:** add an undo action (the themed Sonner toaster is already mounted) or a
confirmation step.

## P2 — fix in this pass or file a follow-up

1. **Theme search and filter are not in the URL.**
   `apps/studio/src/components/themes/ThemeGrid.tsx:13-14` keeps both in
   `useState`. A filtered gallery cannot be linked or restored with Back.
   **Fix:** use `useSearchParams` for `q` and `mode`.
2. **Theme gallery skips a heading level.**
   `apps/studio/src/components/themes/ThemeCard.tsx:44` renders `h3` directly
   under the page `h1`. Add a visually hidden `h2` for the results, or use `h2`
   for the cards.
3. **Three-period ellipses.**
   `PackList.tsx:36` (`+ Add Card...`), `ThemeGrid.tsx:40`
   (`Search themes or authors...`), and `pages/studio.tsx:58`
   (`Fetching @...`). Use `…`.
4. **"Live preview" over sample data.**
   `apps/studio/src/pages/studio.tsx:105` says "Live preview" while the status
   chip says "Sample data". Rename it "Pack preview" so the two do not conflict.
5. **A non-clickable card uses the interactive hover treatment.**
   `apps/studio/src/components/themes/ThemeCard.tsx:7` applies
   `notebook-card--interactive` to a card where only the "Use Theme" button is
   interactive. Remove the interactive class or make the whole card a real link.
6. **The grip icon implies drag-and-drop.**
   `apps/studio/src/components/studio/PackList.tsx:65` shows a `GripVertical`
   handle, but the only reordering controls are the up/down buttons. Remove the
   icon or implement dragging with a keyboard alternative.
7. **The active nav state is missing and misapplied.**
   `apps/studio/src/components/layout/Header.tsx:22-23` marks Studio active on
   `/`, and none of the nav links expose `aria-current="page"`. Fix both.
8. **Status chip changes are not announced.**
   `apps/studio/src/pages/studio.tsx:54-73` swaps loading, live, sample, and
   error chips without a live region. Add `role="status"`/`aria-live="polite"`
   to the status container. The error alert already has `role="alert"`.
9. **The theme empty state is vague.**
   `apps/studio/src/components/themes/ThemeGrid.tsx:65-70` says "Nothing on this
   page yet". Say that no themes match the search and how to clear it.

## P3 — optional polish

1. **React Router future-flag warnings.** The console shows two v7 warnings on
   every route. They are not errors and are unrelated to the UI audit, but they
   keep the console from being clean.
2. **Docs tables lack `scope="col"`.** Add it to the header cells in
   `apps/studio/src/pages/docs.tsx` for explicit table semantics.
3. **Heading anchors can hide under the sticky header.** Add
   `scroll-margin-top` to headings if the docs page starts linking to sections.

## Follow-up

- The P1 and P2 fixes are on `fix/ui-audit-p1`; the findings above remain as the
  record of the baseline, not as open work.
- The optional `@playwright/test` CI smoke suite is still deferred. The manual
  matrix and the baseline come first; the next step is a deterministic smoke job
  for the four routes, not a full visual-regression suite.
