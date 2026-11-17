---
name: ui-review
description: Review Sigil UI changes against DESIGN.md, the pinned Vercel Web Interface Guidelines, and the Sigil UI checklist. Use for any change to apps/studio, styles, tokens, components, copy, or interaction states, and before opening a UI pull request.
---

# Sigil UI review

A static review pass for Sigil's interface. It catches design-system drift,
accessibility defects, and copy problems before a browser check.

## Read first

1. `DESIGN.md` at the repository root. It is the source of truth for color,
   type, layout, components, motion, and voice.
2. `references/sigil-ui-checklist.md` in this skill.
3. `references/web-interface-guidelines.md` in this skill. This is a pinned,
   MIT-licensed snapshot of Vercel's Web Interface Guidelines.

Do not load all three for a trivial copy change. Read `DESIGN.md` and the
checklist; use the Vercel rules when the change touches interaction, forms,
motion, or markup.

## Scope

Review the files the user names, or the current diff against `main`:

```bash
git diff --name-only main...HEAD -- apps/studio
```

If the diff is empty, ask which files to review. Do not review the whole
repository by default.

## Procedure

1. **Map the change.** Identify the route, component, state, and design tokens
   involved. Note whether the change is visual, behavioral, or copy only.
2. **Check the design contract.** Compare against `DESIGN.md`. Flag new colors,
   fonts, radii, shadows, spacing, motion, or vocabulary that are not in the
   system.
3. **Check the rules.** Walk the Sigil checklist and the relevant Vercel
   sections. Prefer semantic HTML and existing primitives over new CSS.
4. **Check every state.** Rest, hover, active, focus-visible, disabled, empty,
   loading, error, and both themes. A component is not done because the happy
   path looks right.
5. **Check the copy.** Voice, Title Case for buttons, sentence case for
   editorial headings, `…` not `...`, honest claims, actionable errors.
6. **Report.** Group by file, most severe first. Include `file:line`, the issue,
   and the concrete fix. Do not pad the report with praise.

For rendered checks, hand off to the `browser-review` skill. This skill does not
replace a real browser pass.

## Severity

| Level  | Meaning                                                                                                                                                                                       | Action                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **P0** | Breaks a working route, traps keyboard focus, hides content, ships a false claim, or fails WCAG AA on primary text                                                                            | Fix before merge                   |
| **P1** | Keyboard or screen-reader defect, destructive action without confirm/undo, missing focus state, layout overflow at 390px, unannounced async state, design-system break that users will notice | Fix before merge                   |
| **P2** | Copy polish, spacing inconsistency, non-blocking state gap, small type or contrast improvement                                                                                                | Fix in this PR or file a follow-up |
| **P3** | Optional refinement or preference                                                                                                                                                             | Mention, do not block              |

If a finding is intentional and documented in `DESIGN.md`, do not flag it. If it
is intentional but undocumented, suggest a `DESIGN.md` note instead of a code
change.

## Output format

```text
## apps/studio/src/components/studio/PackList.tsx

P1 PackList.tsx:58 — clickable div selects a card; not keyboard reachable.
Fix: render a <button type="button"> for the row, keep the action buttons as
siblings, and set aria-pressed={isSelected}.

P2 PackList.tsx:36 — "+ Add Card..." uses three periods.
Fix: "+ Add Card…".

## apps/studio/src/styles/globals.css

✓ pass
```

End with a one-line verdict: **ship**, **ship after P1 fixes**, or **needs
another pass**.

## Guardrails

- Review only. Do not edit files unless the user asks for fixes in the same
  request.
- Do not flag product decisions that are out of scope, such as the missing
  hosted Worker. Flag UI that misrepresents that state.
- Do not propose a new dependency, route, or design system. Work within Sigil.
- Do not copy another product's palette, type, or layout. `DESIGN.md` is the
  reference.
- When a rule and the product conflict, `DESIGN.md` wins; when accessibility and
  aesthetics conflict, accessibility wins.
