# Design references and provenance

Sigil's design layer is project-owned. This file records what informed it, what
was vendored, and what was deliberately not adopted. It exists so a future
contributor can tell the difference between inspiration and a dependency.

## What ships in this repository

| Artifact                          | Location                                                             | Origin                                                                                                                                                          | License                                    |
| --------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Sigil design system               | `DESIGN.md`                                                          | Written for this project from the existing tokens and components                                                                                                | MIT (repository)                           |
| Sigil UI checklist                | `.opencode/skills/ui-review/references/sigil-ui-checklist.md`        | Written for this project                                                                                                                                        | MIT (repository)                           |
| Web Interface Guidelines snapshot | `.opencode/skills/ui-review/references/web-interface-guidelines.md`  | [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines), commit `434b7f91364665f2f733b310ec54809bf8f37937` (2026-10-05) | MIT, Copyright (c) 2025 Vercel Labs        |
| Browser review workflow           | `.opencode/skills/browser-review/` and `.playwright/cli.config.json` | Written for this project; uses Playwright CLI                                                                                                                   | MIT (repository); Playwright is Apache-2.0 |

The Vercel snapshot is vendored so the review does not change when upstream
does. The MIT notice is included in the snapshot. To update it, fetch the new
`command.md`, replace the rules, update the commit and retrieval date here and in
the snapshot header, and re-run `ui-review` on a representative UI diff.

## What informed the structure, but was not copied

### awesome-design-md

- Source: <https://github.com/VoltAgent/awesome-design-md>
- License: MIT
- Use: the section order and level of specificity for `DESIGN.md` — intent,
  color, type, layout, components, motion, voice, accessibility, do/don't,
  implementation map.
- Not used: the 84 third-party `DESIGN.md` files, brand palettes, typefaces, or
  copy. Sigil's values come from `apps/studio/src/styles/tokens.css`.

### Reference product studies

Oura, Notion, Linear, Vercel, and Figma were used only to compare how mature
products document spacing, state, and voice. No palette, typeface, component,
illustration, or copy was copied. When a reference and Sigil's existing
Drawn Notebook language disagreed, Sigil won.

### taste-skill

- Source: <https://github.com/Leonxlnx/taste-skill>
- License: MIT
- Use: reference for the idea of a design gate and a short anti-slop checklist.
- Not adopted: the full starter, its Claude Stop hook, its Node 22+ toolchain,
  and its generated design system. Installing it would duplicate this layer and
  add a runtime the project does not need. An isolated landing-page experiment
  remains optional and out of scope.

### Playwright CLI

- Source: <https://github.com/microsoft/playwright-cli>
- License: Apache-2.0
- Use: the `browser-review` workflow and `.playwright/cli.config.json`.
- Version: the repository pins `playwright` and uses its built-in
  `playwright cli` command. It does not install the separate `@playwright/cli`
  package, which currently depends on an alpha Playwright build.

## What this layer deliberately does not do

- It does not add a public route, a design showcase page, or a component
  gallery.
- It does not add a database, analytics, accounts, or a theme backend.
- It does not auto-load `DESIGN.md` into every agent task. `AGENTS.md` points to
  it; the skills read it when the task is UI work.
- It does not replace human design judgment. The checklist catches regressions;
  it does not choose the product direction.
- It does not add a CI browser suite yet. The baseline audit and the manual
  matrix come first. A deterministic `@playwright/test` smoke job can be added
  later without changing this layer.

## Update policy

1. A new token or component pattern goes into `DESIGN.md` in the same PR that
   introduces it.
2. A new route goes into the route matrix and the header/footer only when it is
   real and working.
3. A third-party rule set is vendored only with a license, a pinned commit, and
   an entry in this file.
4. Do not add a second design document. `DESIGN.md` is the source of truth.
