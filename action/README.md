# Sigil static backup

Commits SVG copies of a Sigil pack into your repository. The profile README can
point at those files, so the cards stay up if the live render API does not.

The action never deletes an existing card when a download fails. A previous
commit remains the backup.

```yaml
name: Sigil backup
on:
  schedule:
    - cron: "0 6 * * *"
  workflow_dispatch:
permissions:
  contents: write
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: askarthemasss/profile-flair-studio/action@main
        with:
          username: octocat
          theme: obsidian
```

`username` is required. `theme` defaults to `obsidian`. `cards` defaults to all
nine kinds. `animate` defaults to `0` so the committed files stay still.
`directory` defaults to `sigil`. `base-url` defaults to `https://sigil.dev`.

After the first run, paste the links in `sigil/README.md` into your profile
README, or keep using the live `https://sigil.dev/c/...` URLs from the studio
and treat this directory as the spare copy.
