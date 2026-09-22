# Sigil Site and Workspace Plan

## Goal
Turn the current single-screen studio into a complete Sigil site with public marketing pages, a responsive full-viewport studio, Google sign-in, and a protected dashboard—while preserving the Obsidian Ledger design system and existing card/render APIs.

## Routes and layouts

### Shared marketing layout
Create a reusable 1120 px marketing shell for:
- `/` — landing page with an interactive username hero and live card preview
- `/themes` — built-in theme gallery with links to details
- `/themes/$id` — theme details and live themed card pack preview
- `/docs` — API and card documentation overview
- `/docs/$card` — generated reference page for each card in the shared card registry
- `/status` — public service status and endpoint health summary

The shared header will include:
- Fraunces “Sigil” wordmark with a 6 px ember dot
- Center navigation: Studio, Themes, Docs, Status
- Active route underline in ember
- Session-aware right side: “Sign in with Google” when signed out; avatar menu with Dashboard and Sign out when signed in
- Mobile sheet navigation below 768 px

### Workspace routes
- `/studio` — full-viewport editor; accepts `?user=` and `?theme=` and initializes controls from valid values
- `/dashboard` — protected presets, account connection summary, and danger zone
- `/auth/callback` — public OAuth completion page that restores the intended destination

The studio and dashboard will use a fixed-height workspace below the header with internal panel scrolling and no document scroll.

## Studio workspace

### Desktop, 1280 px+
Build three columns:
- Left, 320 px: pack/card list and controls
- Center, flexible: live preview on a subtle dotted panel grid
- Right, 340 px: export settings, Markdown preview, copy action, and static-backup option

### Tablet, 768–1279 px
- Keep controls and preview visible
- Move export into a bottom sheet opened from a clear export action

### Mobile, below 768 px
- Replace columns with stable tabs: Controls, Preview, Export
- Keep only one panel visible at a time
- Ensure headers, controls, preview cards, sheets, and dialogs fit at 375 px without clipping or overlap

The existing card registry, theme registry, SVG renderer, and Markdown generator remain the source of truth.

## Authentication and dashboard

- Enable managed Google sign-in in Lovable Cloud
- Add a small auth provider/hook that keeps the router header state current
- Start OAuth from the header using a public `/auth/callback` return URL
- Store the intended same-origin path in `sessionStorage` before sign-in
- Add the integration-managed `_authenticated` route gate and place `/dashboard` beneath it
- Redirect unauthenticated dashboard visits to `/?signin=1`, preserving `/dashboard` for post-login navigation
- Sign out by cancelling and clearing protected queries, ending the session, then replacing history with `/`
- Dashboard reads and writes only the signed-in user’s presets through authenticated server functions and existing row-level security
- Add confirmation dialogs for destructive preset/account actions

## Global interactions

- Keep Sonner toasts at bottom-left
- Add a global Ctrl/Cmd+K command palette with searchable destinations for pages, themes, and all nine card types
- Card commands open `/studio` focused on the selected card; theme commands open the corresponding theme page
- Give every page a route-level error fallback matching Obsidian Ledger
- Keep the root error fallback for unexpected shell failures

## Page content

- Landing: concise product promise, username input, live SVG result, reliability/backup explanation, and direct Studio action
- Themes: all six built-ins, their palettes, mode, feel, and preview; voting controls appear only when signed in
- Docs: generated from `CARD_KINDS`, with URL/query examples and one page per card
- Status: current public API/card endpoint checks with clear operational states and last-check time
- Dashboard: saved presets, Google account identity, and guarded deletion/sign-out actions

## Metadata and verification

- Add unique title, description, Open Graph title/description, `og:type`, and Twitter card metadata to every content route
- Preserve API/server routes outside visual layouts
- Verify navigation, active states, OAuth return behavior, query parameters, command palette, copy/export flow, and protected dashboard redirects
- Test the studio at 1440 px, tablet width, and 375 px; confirm no page scroll in workspace views and no clipped text
- Check preview console/runtime errors and the final build signal

## Assumptions

- “Sign in with GitHub” is replaced everywhere by “Sign in with Google,” as selected
- Theme voting is represented by sign-in-aware UI using the existing vote table; no new social or community submission workflow is added
- Status is a live browser-side health view of Sigil’s existing public endpoints, not a separate monitoring service
