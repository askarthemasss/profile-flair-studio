# Community themes

This directory holds community theme submissions. Each theme is a single JSON file validated against the schema in [`packages/core/src/types.ts`](../../packages/core/src/types.ts).

> The studio gallery currently lists the six built-in themes. Community files are validated and collected here; wiring them into the gallery is on the [roadmap](../../roadmap.md).

## Theme format

Create a file named after your theme ID, for example `foggy-morning.json`:

```json
{
  "id": "foggy-morning",
  "name": "Foggy Morning",
  "author": "octocat",
  "version": 1,
  "mode": "light",
  "colors": {
    "bg": "#f4f6f5",
    "bgAlt": "#e7ecea",
    "border": "#c9d3cf",
    "text": "#14201b",
    "textMuted": "#5c6b65",
    "accent": "#1f6f5c",
    "accent2": "#2f8f78",
    "success": "#15803d",
    "warning": "#b45309",
    "danger": "#b91c1c"
  },
  "heat": ["#e7ecea", "#b9d8ce", "#7fbcac", "#4a9a85", "#1f6f5c"],
  "font": "sans",
  "radius": 10,
  "effects": {
    "glow": false,
    "grain": true
  }
}
```

### Field notes

| Field           | Rules                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| `id`            | Lowercase letters, digits, and hyphens; 2–40 characters; must be unique |
| `name`          | 2–40 characters                                                         |
| `author`        | A valid GitHub login                                                    |
| `version`       | Must be `1`                                                             |
| `mode`          | `"dark"` or `"light"`                                                   |
| `colors`        | Ten six-digit hex colors, including `#`                                 |
| `heat`          | Exactly five six-digit hex colors, from lowest to highest               |
| `font`          | `"mono"`, `"sans"`, or `"serif"`                                        |
| `radius`        | Integer from 0 to 24                                                    |
| `effects.glow`  | Boolean                                                                 |
| `effects.grain` | Boolean                                                                 |

## Validate before submitting

From the repository root:

```bash
pnpm validate:themes
```

The validator checks the schema and enforces:

- Text contrast of at least **4.5:1** against the background.
- Accent contrast of at least **3:1** against the background.

If validation fails, adjust the palette and run it again. Include the command output in your pull request.

## Submit

1. Add your JSON file to this directory.
2. Run `pnpm validate:themes`.
3. Open a pull request using the theme submission template or the normal PR template.
4. Include a screenshot or a rendered card preview if you can.

By submitting a theme, you confirm that you are its author or have permission to contribute it under the repository's [MIT License](../../LICENSE).
