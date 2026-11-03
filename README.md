# Profile Flair Studio

Project name: Sigil (working name). Store the brand name and tagline in one constant, packages/core/src/brand.ts, so a rename is a one-file change.

Tagline: Your developer sigil. Nine living cards for your GitHub profile, one line to install.

What it is: Sigil is a free, open-source (MIT) service that turns a GitHub username into a set of beautiful, animated SVG cards (stats and rank, streak, languages, contribution heatmap, isometric skyline, activity graph, achievements, repo card, banner). Developers paste one line of Markdown into their profile README. A web studio lets them design the pack live, pick from community themes, and copy the exact snippet.

Target user: A developer with a GitHub profile README who wants it to look distinctive without wiring up five different tools, and who has been burned by stat cards that show a rate-limit error. Secondary user: theme designers who contribute themes by pull request.

Core value proposition:

PillarMeaningReliableA card never shows an error. Stale data is served instantly and refreshed in the background.BeautifulNine cards share one design language. Themes are first-class and community-made.Zero-configWorks with only a username. No login, no token, no setup.IndependentA GitHub Action commits static copies of the cards to the user's own repo, so the profile survives if Sigil goes down.

Why this exists: Existing card tools are single-purpose, and the most popular public instance is rate-limited and unreliable. The root cause is the GitHub API limit of 5,000 GraphQL points per hour per token. Sigil's architecture is built around that limit (see Section 9).

Platform: Web app (studio), edge render API, GitHub Action, public JSON API.

Deployment target: Studio on Vercel. Render API on Cloudflare Workers (stateless, no database). Action published to the GitHub Marketplace.

Locked scope decisions (do not revisit):

DecisionChoiceData accessPublic-only. No login, no OAuth, no stored user tokens.DeliveryLive image URLs plus a GitHub Action that commits static SVGs as a backupv1 scopeCards, live studio (design + copy Markdown), community theme galleryExplicitly NOT in v1Year-wrapped, public profile pages, coding clock, PNG endpoint, i18n, AI features

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/56c65e09-70b7-4cea-94d3-8f5f9f56e8d5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js 20+ and pnpm 9+ — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and [install pnpm](https://pnpm.io/installation).

```sh
git clone <this-repository-url>
cd <repository-name>
pnpm install
pnpm dev
```

Useful commands:

```sh
pnpm typecheck        # all packages
pnpm test             # core stats tests
pnpm lint             # studio lint
pnpm build            # all packages
pnpm validate:themes  # WCAG theme validation
pnpm check:svg        # SVG size budget
```
