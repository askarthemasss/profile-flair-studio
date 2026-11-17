# Sigil UI checklist

Use this with `DESIGN.md` and the pinned Vercel guidelines. It is ordered by
what breaks first.

## 1. Design-system fit

- [ ] Colors come from `tokens.css`; no raw hex in components.
- [ ] Theme previews and card previews are the only intentional color
      exceptions, because their colors are product content.
- [ ] Fonts are Cormorant Garamond, Inter, or JetBrains Mono. No new family.
- [ ] Content cards stay at or below a 14px radius; buttons and chips are pills.
- [ ] Spacing follows 4/8/12/16/24/32/48/64.
- [ ] Shadows use `--shadow-card` / `--shadow-elevated`; no new blurry shadows.
- [ ] Icons are Lucide with the global 1.25 stroke; no emoji as UI.
- [ ] One primary action per region; secondary actions stay quiet.
- [ ] New UI would look at home on the same notebook page.

## 2. Semantics and keyboard

- [ ] Navigation uses `<a>` / `<Link>`; actions use `<button>`.
- [ ] No `onClick` on a `div` or `span` for selection, navigation, or actions.
- [ ] Every icon-only control has an `aria-label`.
- [ ] Every input, select, and textarea has a `<label>` or `aria-label`.
- [ ] Tab order follows the visual order.
- [ ] Enter and Space activate buttons; Escape closes overlays.
- [ ] The skip link is first and targets `#main`.
- [ ] There is exactly one `<h1>` per route, and headings are hierarchical.
- [ ] Focus is visible and is not covered by the sticky header.
- [ ] Toggle groups expose state with `aria-pressed` or an equivalent.

## 3. States

- [ ] Rest, hover, active, focus-visible, and disabled are all defined.
- [ ] Hover increases contrast; focus is never removed.
- [ ] Disabled controls look disabled and do not respond.
- [ ] Empty states say what is missing and what to do next.
- [ ] Loading states keep layout stable and say what is loading.
- [ ] Errors use `role="alert"`, name the problem, and give a next step.
- [ ] Sample data, live data, and last-loaded data are visibly different.
- [ ] Copy, save, load, and validation feedback is announced (`aria-live`).
- [ ] Destructive actions have confirmation or an undo window.
- [ ] Long text is truncated or wrapped without breaking the layout.
- [ ] Flex children that hold text have `min-w-0`.

## 4. Layout and responsive

- [ ] No horizontal overflow at 320px or 390px.
- [ ] The 1440px layout uses the width intentionally; it is not a stretched
      tablet layout.
- [ ] Tables scroll inside `.notebook-table-wrap`.
- [ ] Code blocks scroll inside `.notebook-code`.
- [ ] The mobile header nav does not wrap into a broken second row.
- [ ] Touch targets are at least 24×24px; primary controls aim for 44×44px.
- [ ] `env(safe-area-inset-*)` is considered for full-bleed mobile surfaces.
- [ ] The theme toggle collapses to an icon at 600px and keeps its label.

## 5. Color and contrast

- [ ] Body and UI text meet 4.5:1; large text meets 3:1.
- [ ] `--terracotta-ink` is used for accent text; `--terracotta` is for marks.
- [ ] State is not communicated by color alone.
- [ ] Both light and dark mode use the same tokens and read correctly.
- [ ] Dark mode stays warm; no pure black or cold blue-grey.
- [ ] `color-scheme` and `<meta name="theme-color">` follow the active theme.
- [ ] Native selects have explicit background and text colors.
- [ ] The theme is applied before first paint; no flash of the wrong mode.

## 6. Motion

- [ ] `prefers-reduced-motion: reduce` disables animation and reveals content.
- [ ] Only `transform` and `opacity` are animated.
- [ ] No `transition: all`.
- [ ] No looping, pulsing, parallax, autoplay, or scroll-jacking.
- [ ] Motion does not hide content when JavaScript fails.
- [ ] Hover lift stays at 1–2px; cards do not scale.

## 7. Copy and honesty

- [ ] Voice is second person, active, and specific.
- [ ] Page titles and nav use Title Case; editorial section headings use
      sentence case.
- [ ] Buttons are Title Case and verb-first.
- [ ] Ellipses use `…`, not `...`.
- [ ] Numbers are numerals.
- [ ] Errors say how to fix the problem.
- [ ] No hype words, exclamation marks, or fake urgency.
- [ ] No feature, metric, integration, or live status is implied unless it is
      actually wired up.
- [ ] Placeholders show a real example or a prompt, not a fake value.

## 8. URL and persistence

- [ ] Filters, tabs, search, and expanded panels that users expect to share are
      reflected in the URL.
- [ ] Internal links support Cmd/Ctrl+click and middle-click.
- [ ] Persisted UI state has a clear reset path.
- [ ] The studio pack still restores from `localStorage` after reload.
- [ ] Theme choice still restores from `color-scheme` after reload.

## 9. Performance and assets

- [ ] No new runtime dependency without a clear reason.
- [ ] Images have explicit dimensions; below-fold images lazy-load.
- [ ] Large lists are virtualized or cheap to render.
- [ ] No layout reads in render.
- [ ] Fonts keep `display=swap` and preconnect.
- [ ] The SVG card budget stays under 45 KB.

## 10. Route matrix

The only working routes are:

| Route     | Purpose                              |
| --------- | ------------------------------------ |
| `/`       | Landing page and live vector preview |
| `/studio` | Pack configuration and export        |
| `/themes` | Theme gallery and apply flow         |
| `/docs`   | Embed, parameter, and API reference  |

Anything else must not be added as a placeholder. The SPA wildcard sends unknown
paths to `/`; that is intentional.
