# Browser review matrix

The compact checklist behind `browser-review`. Four routes, two themes, two
widths. Every cell also requires a clean console and no horizontal overflow.

## Routes

| Route     | What must work                                                       |
| --------- | -------------------------------------------------------------------- |
| `/`       | Hero copy, card previews, "Open the Studio", "Browse Themes", footer |
| `/studio` | Username load, card parameters, reorder, remove, reset, export, copy |
| `/themes` | Search, mode filter, "Use Theme" → studio with the chosen theme      |
| `/docs`   | Endpoint tables, code blocks, parameter table, API notes             |

## Matrix

| Width | Theme | Routes                             | Specific checks                                      |
| ----- | ----- | ---------------------------------- | ---------------------------------------------------- |
| 1440  | Light | `/`, `/studio`, `/themes`, `/docs` | Intentional use of width, no stretched tablet layout |
| 1440  | Dark  | `/`, `/studio`, `/themes`, `/docs` | Warm blacks, token parity, theme-color meta          |
| 390   | Light | `/`, `/studio`, `/themes`, `/docs` | No overflow, nav scrolls, tables/code scroll inside  |
| 390   | Dark  | `/`, `/studio`, `/themes`, `/docs` | Same, plus readable secondary text                   |

## Interaction checks

- [ ] Skip link is first and jumps to `#main`.
- [ ] Tab order is visual order; focus ring is visible on every control.
- [ ] Pack row selection, reorder, remove, and reset work by keyboard.
- [ ] Theme toggle works by keyboard and persists across reload.
- [ ] Theme gallery search and filter work; "Use Theme" lands in the studio.
- [ ] Export format buttons are reachable and expose their active state.
- [ ] Copy snippet announces success.
- [ ] Empty pack shows the empty state and a way back.
- [ ] Invalid username shows an inline error with a next step.
- [ ] Sample data is labelled as sample data.
- [ ] Reduced motion shows all content immediately.

## Evidence

Name screenshots `{route}-{theme}-{width}.png`, for example
`studio-dark-390.png`. Keep them in `.playwright-cli/`; attach only the useful
ones to a pull request. Because `--filename` resolves against the workspace
root, pass the directory explicitly:

```bash
pnpm exec playwright cli -s=sigil-review screenshot --filename=.playwright-cli/studio-dark-390.png
```
