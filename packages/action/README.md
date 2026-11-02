# Sigil — Static SVG Backup Action

Fetches your GitHub stats with your own token and writes static SVG copies of the Sigil cards. No Sigil server required, so the images in your profile keep working even if the hosted API is down.

## Usage

```yaml
name: Update Sigil cards

on:
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  sigil:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: askarthemasss/profile-flair-studio/packages/action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          username: ${{ github.repository_owner }}
          theme: obsidian
          output-dir: .sigil

      - name: Commit refreshed cards
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add .sigil
          git diff --staged --quiet || git commit -m "chore: refresh Sigil cards"
          git push
```

Then reference the files from your profile README:

```md
![Sigil overview](.sigil/overview.svg)
![Sigil streak](.sigil/streak.svg)
```

## Inputs

| Input | Required | Default |
| --- | --- | --- |
| `github-token` | yes | — |
| `username` | yes | — |
| `theme` | no | `obsidian` |
| `output-dir` | no | `.sigil` |
| `cards` | no | all nine kinds |

`cards` accepts a comma-separated list of: `overview`, `streak`, `languages`, `heatmap`, `skyline`, `activity`, `achievements`, `repo`, `banner`.

## Outputs

| Output | Description |
| --- | --- |
| `files-written` | Number of SVGs written |
