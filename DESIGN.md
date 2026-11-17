# Sigil Design System

> The source of truth for Sigil's interface. Read this before changing a page,
> component, token, or piece of UI copy. It describes what exists today; it is
> not a wishlist.

Sigil is a notebook of developer evidence. The studio should feel like a page
someone kept by hand: warm paper, dark ink, a gold rule, a terracotta mark in
the margin. The cards are the content. The interface exists to frame them, not
to compete with them.

## 1. Design intent

**Drawn Notebook** is the name of the visual language.

- **Paper, not glass.** Surfaces are warm off-whites in light mode and deep
  warm blacks in dark mode. Translucency is a light hand, never a glassmorphism
  effect.
- **Ink, not chrome.** Type carries the hierarchy. Borders are hairlines,
  shadows are barely there, and decoration is a rule, a dot, or a small drawn
  mark.
- **One accent per thought.** Terracotta marks the active idea. Gold marks a
  rule, focus, or quiet emphasis. Everything else is paper and ink.
- **Quiet motion.** Entrances fade and lift once. Hover states move a pixel or
  two. Nothing loops, pulses, or demands attention.
- **The work is the ornament.** The card previews, theme swatches, and real
  export snippets are the visual interest. Do not add ornamental UI around them.

### Product character

Editorial, precise, unhurried. A tool for developers who care how their profile
reads. Confident enough to use whitespace. Never cute, never corporate, never
"AI-powered".

## 2. Principles

1. **Preserve the notebook.** New UI should look like it was added to the same
   page, not bolted on from another product.
2. **Make the next action obvious.** One primary action per region. Secondary
   actions stay quiet. Destructive actions are never the easiest click.
3. **Show real state.** Sample data, live data, empty packs, and failed lookups
   must be visibly different. Never imply a capability that is not wired up.
4. **Accessible by construction.** Keyboard access, visible focus, contrast,
   reduced motion, and semantic HTML are part of the definition of done.
5. **Small and stateless.** No database, no accounts, no tracking. The design
   should not suggest otherwise.

## 3. Color

All UI color comes from `apps/studio/src/styles/tokens.css`. Components must use
tokens or Tailwind utilities mapped to tokens, not raw hex values.

### Core palette

| Token              | Light                  | Dark                   | Role                                     |
| ------------------ | ---------------------- | ---------------------- | ---------------------------------------- |
| `--cream`          | `#f7f5f0`              | `#141210`              | Page background                          |
| `--sage`           | `#eef3ed`              | `#171816`              | Alternate section and footer surface     |
| `--parchment`      | `#f1ece3`              | `#1a1815`              | Closing section surface                  |
| `--warm-white`     | `#faf8f5`              | `#1e1b18`              | Raised surface, primary button text      |
| `--linen`          | `#f3efe8`              | `#181614`              | Reserved warm neutral                    |
| `--sage-tint`      | `#eff3ee`              | `#161815`              | Reserved green-tinted surface            |
| `--charcoal`       | `#1a1a1a`              | `#ede8e1`              | Primary ink, headings, primary button    |
| `--soft-black`     | `#2c2c2c`              | `#d8d2c8`              | Body ink                                 |
| `--warm-grey`      | `#6f6963`              | `#9e978f`              | Secondary ink, labels, captions          |
| `--light-grey`     | `#c5bfb8`              | `#38342e`              | Disabled ink, scrollbar, quiet icons     |
| `--terracotta`     | `#b87a5a`              | `#d98a62`              | Active accent, icon accents              |
| `--terracotta-ink` | `#8f563d`              | `#e0a07a`              | Accent text that must pass on paper      |
| `--gold`           | `#c4956a`              | `#d4a373`              | Rules, focus ring, small celestial marks |
| `--gold-dim`       | `rgba(196,149,106,.3)` | `rgba(212,163,115,.3)` | Hairline rules and orbits                |
| `--indigo`         | `#6b6ea0`              | `#8c8fb8`              | Reserved cool accent                     |
| `--blush`          | `#f0ebe5`              | `#241e1a`              | Selected segment, soft highlight         |
| `--sage-dark`      | `#8b9e8b`              | `#9eaf9e`              | Reserved muted green                     |

### Functional accents

Warmed so they belong to the palette. Use them for state, not decoration.

| Token            | Light     | Dark      | Meaning                      |
| ---------------- | --------- | --------- | ---------------------------- |
| `--sg-verdigris` | `#4a664a` | `#a8c0a8` | Success, live data, presence |
| `--sg-crimson`   | `#a44a3f` | `#e08a7a` | Error, destructive intent    |
| `--sg-azure`     | `#5a6b9e` | `#9aa6d6` | Informational, links         |

### Surfaces

| Token                 | Role                                            |
| --------------------- | ----------------------------------------------- |
| `--card-glass`        | Default translucent card background             |
| `--card-glass-hover`  | Card hover background                           |
| `--card-item-bg`      | Inputs, code blocks, preview canvas, flat cards |
| `--card-item-hover`   | Input focus, selected pack item                 |
| `--card-border`       | Default 1px border                              |
| `--card-border-hover` | Hover and focus border                          |
| `--card-shadow`       | Resting card shadow                             |
| `--card-shadow-hover` | Hover card shadow                               |
| `--card-inset`        | 1px inner highlight on light surfaces           |
| `--badge-bg`          | Sticky header and theme-toggle background       |
| `--scrim`             | Reserved overlay scrim                          |

### Color rules

- **Never hardcode a palette color in a component.** Use `text-charcoal`,
  `bg-cream`, `border-line`, or a token in a style object.
- **Theme swatches are product content.** `ThemeCard` and `CardPreview` render
  colors that come from card theme JSON. Those values are exempt from the UI
  palette because they are the thing being previewed.
- **Accent text needs `--terracotta-ink`.** `--terracotta` is for marks and
  icons. On paper, use the ink variant for text.
- **Functional color is a signal.** Do not use verdigris, crimson, or azure as
  general decoration.
- **Contrast is a gate.** Body and UI text should meet WCAG AA (4.5:1 for normal
  text, 3:1 for large text and meaningful non-text). Measure before lowering a
  value.
- **Selection is gold-tinted.** Keep the existing `::selection` treatment.
- **Dark mode is warm, not inverted.** Do not replace it with pure black,
  blue-grey, or a cold slate.

## 4. Typography

| Family             | Token          | Use                                                         |
| ------------------ | -------------- | ----------------------------------------------------------- |
| Cormorant Garamond | `--font-serif` | Page titles, section titles, card names, editorial captions |
| Inter              | `--font-sans`  | Body, labels, buttons, navigation, tables                   |
| JetBrains Mono     | `--font-mono`  | Handles, URLs, code, counts, parameter names                |

Loaded in `apps/studio/index.html` with `display=swap`. Weights used: Cormorant
300/400/500/600, Inter 300/400/500, JetBrains Mono 400/500.

### Scale in practice

| Role           | Treatment                                                                       |
| -------------- | ------------------------------------------------------------------------------- |
| Hero title     | `font-display`, 48–72px, weight 300, `leading-[1.05]`, `tracking-[0.03em]`      |
| Page title     | `.section-title`, `clamp(1.8rem, 4vw, 3rem)`, weight 300                        |
| Section title  | `.section-title--sm`, `clamp(1.35rem, 2.6vw, 1.75rem)`                          |
| Lede           | `.notebook-lede`, Cormorant, `clamp(1.05rem, 1.6vw, 1.22rem)`, 1.85 line height |
| Body           | `.notebook-body` or Inter 300, 0.82–0.84rem, 1.75 line height                   |
| UI label       | `.notebook-label`, 0.64rem, 500, 0.12em tracking, uppercase                     |
| Kicker         | `.notebook-kicker`, 0.64rem, 600, 0.16em tracking, uppercase                    |
| Button / field | Inter 500/400, 0.7–0.78rem                                                      |
| Code           | `.notebook-code`, mono, 0.7rem, 1.7 line height                                 |
| Metadata       | mono, 9–11px, warm grey                                                         |

### Type rules

- **One display face, one workhorse, one mono.** Do not introduce a fourth
  family or a new Google Font.
- **Weights stay light.** Body is 300; UI emphasis is 500; labels and table
  heads are 600. Avoid 700+ except where a card renderer needs it.
- **Italic is voice, not emphasis.** Use it for editorial captions, kickers,
  and the theme toggle label. Do not italicize body paragraphs for emphasis.
- **Uppercase is for labels only.** Always pair it with tracking. Never set a
  sentence in uppercase.
- **Use `…`, not `...`.** Loading and placeholder copy ends with the ellipsis
  character.
- **Use `font-variant-numeric: tabular-nums` for changing numbers** in stats or
  comparison columns.
- **Use `text-wrap: balance` on headings and `text-pretty` on ledes** where the
  layout supports it. Do not let a heading leave one word on a line.
- **Do not center long body copy.** Centered text is for short closing notes.

## 5. Layout and space

- **Page width:** `max-w-7xl` (1280px) for landing, studio, and themes;
  `max-w-5xl` (1024px) for docs.
- **Side padding:** 16px mobile, 24px tablet, 32px desktop. The token
  `--side-pad` is available for full-bleed editorial sections.
- **Studio grid:** 12 columns on `lg`; controls take 4, preview takes 8. Controls
  stack above the preview below `lg`.
- **Vertical rhythm:** sections use 80–96px padding; cards use 20–24px internal
  padding; control groups use 12–24px gaps.
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64px. Prefer the scale over
  arbitrary values.
- **Borders:** 1px everywhere. Use `--card-border`; strengthen on hover or
  selection.
- **Radii:** 4px small, 8px default, 10px cards, 14px maximum for content cards,
  full pill for buttons and chips. Do not introduce 16px+ content cards.
- **Shadows:** use `--shadow-card` / `--shadow-elevated`. Hover may add 2px of
  lift. Do not use large blurry shadows.
- **Density:** comfortable, not airy for its own sake. A control panel should
  read as one instrument, not a set of unrelated cards.
- **Responsive:** the page must work at 320px. Test 390, 768, 1024, and 1440.
  No horizontal overflow. Tables scroll inside their wrapper. The header nav
  scrolls on mobile instead of wrapping into a second row of links.

### Page anatomy

- Sticky header, 64px minimum, with brand, primary nav, theme toggle, and GitHub
  link.
- One `<main id="main">` per page and a skip link before it.
- Footer with brand, nav, source link, and copyright.
- Grain overlay is fixed, non-interactive, and below the skip link in stacking
  order.

## 6. Components

Reuse the classes in `apps/studio/src/styles/globals.css` before writing new
CSS. New component classes belong in that file, next to their siblings.

### Buttons

| Variant                    | Use                              |
| -------------------------- | -------------------------------- |
| `.notebook-btn--primary`   | The one main action in a region  |
| `.notebook-btn--secondary` | Supporting action                |
| `.notebook-btn--ghost`     | Tertiary or icon-adjacent action |
| `.notebook-btn--sm`        | Dense control panels             |
| `.notebook-btn--icon`      | Square icon-only control         |

- Pill radius, 1px border, Inter 500, 0.78rem (0.7rem small).
- Hover lifts 1px; active scales to 0.98; disabled drops to 0.5 opacity and
  `cursor: not-allowed`.
- Icon-only buttons need an `aria-label`.
- Destructive buttons use crimson on hover and require confirmation or undo.

### Fields

- `.notebook-field` is the only text input, select, and textarea treatment.
- Always pair with a `<label>` or `aria-label`.
- Use the correct `type`, `inputMode`, `autoComplete`, and `spellCheck`.
- Focus uses the gold ring. Do not remove the outline without a replacement.
- Placeholders show an example and end with `…` only when they are prompts, not
  when they are examples like `e.g. torvalds`.
- Native selects need explicit background and text colors in dark mode.

### Cards

- `.notebook-card` for grouped content; `.notebook-card--interactive` only when
  the whole card is a link or has a clear hover action.
- `.notebook-card--flat` for inset surfaces inside a card.
- Cards are not buttons. If the whole card is clickable, use a link or button
  wrapper with keyboard support; do not put `onClick` on a `div`.

### Chips and status

- `.notebook-chip` for quiet metadata and trust markers.
- `.notebook-chip--status` for uppercase status labels.
- Live, sample, loading, and error states must be distinguishable by text, not
  color alone.
- Async status changes need `aria-live="polite"` or an equivalent announcement.

### Segmented controls

- `.segmented` + `.segmented__btn` for mutually exclusive views (export format,
  theme mode).
- The active segment uses `data-active="true"` and the blush background.
- Use real buttons with `aria-pressed` when the control is a toggle group.

### Tables and code

- Wrap tables in `.notebook-table-wrap` so they scroll on narrow screens.
- Use `.notebook-table` for docs tables; keep header labels short.
- Use `.notebook-code` for multi-line code and `.notebook-inline-code` for
  tokens in prose.
- Code blocks must not overflow the card; horizontal scrolling stays inside the
  block.

### Navigation

- Use `<Link>` for internal routes and `<a>` for external links.
- The active route gets terracotta text and a gold underline.
- External links open in a new tab only when leaving the product; include
  `rel="noreferrer"`.
- The skip link must be the first focusable element.

### Theme toggle

- The celestial disc is decorative; the button carries the accessible label.
- At 600px and below, the text label hides and the control becomes a 36px icon
  button.
- The chosen theme persists in `localStorage` under `color-scheme` and is applied
  before first paint by the inline script in `index.html`.

### Empty, loading, and error states

- **Empty:** say what is missing and the next action. Example: "No cards in this
  pack yet. Select a card above to begin."
- **Loading:** show a spinner plus text; keep the layout stable.
- **Error:** use `role="alert"`, name the problem, and say how to fix it. Keep
  the last good preview visible when possible.
- **Sample data:** label it clearly. Never let sample data look live.

## 7. Motion

| Token             | Value                           | Use                        |
| ----------------- | ------------------------------- | -------------------------- |
| `--ease-out`      | `cubic-bezier(.25,.46,.45,.94)` | Entrances, hover           |
| `--ease-smooth`   | `cubic-bezier(.4,0,.2,1)`       | Reserved for larger moves  |
| `--duration-slow` | `1.2s`                          | Scroll reveal              |
| `--duration-med`  | `0.8s`                          | Reserved                   |
| `--duration-fast` | `0.4s`                          | Reserved                   |
| Component motion  | `0.25s`–`0.35s`                 | Buttons, cards, theme swap |

- Animate `transform` and `opacity` only. Never `transition: all`.
- Hover lift is 1–2px. Do not scale cards on hover.
- The hero entrance runs once. Scroll reveals run once per element.
- `prefers-reduced-motion: reduce` disables all animation and transition and
  forces reveal content visible. This is a hard requirement.
- Do not add autoplay, looping, pulsing, parallax, or scroll-jacking.
- Motion must never hide content if JavaScript fails.

## 8. Iconography

- Lucide only. The global `.lucide` rule sets `stroke-width: 1.25` to match the
  drawn-ink line weight.
- Icons are 12–20px in UI, 20–24px in feature marks.
- Decorative icons get `aria-hidden="true"`. Icon-only controls get an
  `aria-label`.
- Do not mix icon families or use emoji as UI iconography.
- The Sigil mark is drawn inline so gold and terracotta follow the theme.

## 9. Voice and copy

Sigil sounds like a careful maintainer, not a growth team.

- **Person:** second person. "Arrange your cards", not "Users can arrange".
- **Voice:** active. "Load a profile", not "A profile will be loaded".
- **Headings:** page titles and navigation in Title Case; editorial section
  headings in sentence case.
- **Buttons:** Title Case, verb-first. "Open the Studio", "Copy Snippet",
  "Submit a Theme".
- **Labels:** authored in sentence case, rendered uppercase by CSS.
- **Numbers:** numerals. "9 cards", not "nine cards".
- **Ellipsis:** `…`.
- **Quotes:** curly quotes in prose; straight quotes only in code.
- **Errors:** name the problem and the next step. "No GitHub user named
  `@handle`. Check the spelling and try again."
- **Empty states:** what is empty, then what to do.
- **No hype.** Avoid "magic", "seamless", "unleash", "supercharge", "AI-powered",
  "revolutionary", "blazingly fast", and exclamation marks.
- **No fake claims.** If a Worker is not configured, say the URLs are not live.
- **Product vocabulary:** pack, cards, flair, theme, notebook, page, ink. Avoid
  "dashboard", "workspace", "project", and "asset" for the same ideas.

## 10. Accessibility

- Every interactive element is reachable and operable by keyboard.
- Focus is always visible. The global ring is a 2px gold outline with a 3px
  offset; do not remove it.
- Use semantic elements first: `<button>`, `<a>`, `<label>`, `<table>`,
  `<nav>`, `<main>`.
- Every form control has a label. Every icon-only control has an accessible
  name.
- Headings are hierarchical. Each page has exactly one `<h1>`.
- Async feedback (copy, validation, loading, errors) is announced with
  `aria-live` or `role="alert"`.
- Color is never the only signal. Pair it with text, an icon, or a state.
- Target size is at least 24×24px; prefer 44×44px for primary touch controls.
- The skip link is the first focusable element and targets `#main`.
- Sticky elements must not cover the focused element.
- Reduced motion is honored globally.
- Images have `alt`; decorative images use `alt=""`.

## 11. Dark mode

- Dark mode is a warm night notebook: deep brown-black paper, cream ink, lifted
  terracotta and gold.
- The theme is applied by `data-theme="dark"` on `<html>` before first paint.
- `color-scheme` and `<meta name="theme-color">` follow the active theme.
- Both modes use the same tokens. If a component looks right in one mode and
  wrong in the other, fix the token, not the component.
- Do not use pure `#000`, cold blue-greys, or inverted brand colors.
- Theme swatches in the gallery are content and may be light, dark, or anything
  in between; their surrounding UI still follows the active mode.

## 12. Do and don't

**Do**

- Use the existing tokens, classes, and Lucide icons.
- Keep one primary action per region.
- Label sample, live, empty, loading, and error states honestly.
- Test light and dark, 1440 and 390, keyboard and reduced motion.
- Prefer deleting a decoration to adding one.
- Keep the card previews and export snippets as the visual center.

**Don't**

- Add gradients, glows, neon, purple, or glassmorphism.
- Add a new font, icon set, or color outside the tokens.
- Use emoji as UI.
- Put `onClick` on a `div` or `span` for navigation or selection.
- Use `outline: none` without a focus-visible replacement.
- Use `transition: all`.
- Add a modal, toast, or animation for a state that can be shown inline.
- Invent a feature, metric, or integration that is not wired up.
- Center long paragraphs or set body copy in uppercase.
- Use a radius above 14px on a content card.

## 13. Implementation map

| Concern                             | File                                 |
| ----------------------------------- | ------------------------------------ |
| Color, type, spacing, motion tokens | `apps/studio/src/styles/tokens.css`  |
| Base styles and component classes   | `apps/studio/src/styles/globals.css` |
| Theme prepaint and font loading     | `apps/studio/index.html`             |
| Routes                              | `apps/studio/src/App.tsx`            |
| Layout shell, header, footer        | `apps/studio/src/components/layout/` |
| Studio controls and preview         | `apps/studio/src/components/studio/` |
| Theme gallery                       | `apps/studio/src/components/themes/` |
| Reusable UI primitives              | `apps/studio/src/components/ui/`     |

### Adding a token

1. Add it to `:root` and `:root[data-theme="dark"]` in `tokens.css`.
2. Map it in the `@theme inline` block in `globals.css` if Tailwind should see it.
3. Use the token; do not duplicate the value.
4. Check both modes and the contrast of any text pair.

### Adding a component

1. Reuse an existing class or primitive first.
2. Add the class to `globals.css` beside its siblings.
3. Cover rest, hover, active, focus-visible, disabled, empty, loading, and error
   states where applicable.
4. Add keyboard behavior and an accessible name.
5. Verify at 390px and in both themes.

### Adding a route

1. Add it to `App.tsx` and the header/footer navigation only if it is a real,
   working surface.
2. Give it one `<h1>`, a skip-link target, and a document title.
3. Add it to the browser-review matrix in
   `.opencode/skills/browser-review/SKILL.md`.
4. Do not add a route that is a placeholder or a "coming soon" page.

## 14. Review workflow

1. Read this document and the relevant section of the implementation map.
2. Run the `ui-review` skill on the changed files. Fix P0 and P1 findings.
3. Run the `browser-review` skill against the four working routes in light and
   dark, at 1440 and 390, with reduced motion.
4. Record any new limitation in the PR description. Do not hide it.

The current route surface is `/`, `/studio`, `/themes`, and `/docs`. Anything
else is out of scope until it is real.
