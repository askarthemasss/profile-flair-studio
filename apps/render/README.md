# Sigil render Worker

Edge API that renders SVG cards and serves normalized snapshots.

- `GET /c/:kind/:user` — SVG card
- `GET /snapshot/:user` — normalized snapshot JSON
- `GET /themes` — builtin themes
- `GET /health` — status and API version

Every route is also available under `/v1`. See `apps/studio/src/pages/docs.tsx` for the public docs.

There is no database. GitHub responses are normalized in memory and cached in the per-colo Cloudflare Cache API for 4 hours, with stale-while-revalidate: an expired entry is served immediately and refreshed in the background.

## Deploy

### 1. Cloudflare credentials

Create a Cloudflare API token from the **Edit Cloudflare Workers** template, then copy your account ID.

Add both as GitHub repository secrets so `.github/workflows/deploy.yml` can deploy on push to `main`:

| Secret                  | Where to find it                                    |
| ----------------------- | --------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare dashboard → My Profile → API Tokens      |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Account ID |

Without `CLOUDFLARE_API_TOKEN` the deploy step is skipped, which is why `main` can be green while no Worker exists.

If the very first deploy fails with an authorization error, the token cannot create a new Worker: either create an empty `sigil-render` Worker once in the dashboard, or grant the token Workers Admin for that first run.

### 2. Deploy

The first deploy must happen before the secret in step 3, because `wrangler secret put` targets an existing Worker.

Either push to `main` (with the secrets from step 1 in place) or deploy locally after `wrangler login`:

```bash
pnpm --filter @sigil/render deploy
```

The Worker name is `sigil-render`, so by default it lands at:

```
https://sigil-render.<your-subdomain>.workers.dev
```

### 3. GitHub token

`wrangler deploy` does not set secrets. With the Worker now deployed, run once from `apps/render`:

```bash
pnpm exec wrangler secret put GITHUB_TOKEN
```

Use a classic PAT with `public_repo` read, or a fine-grained token with public read. It may be a comma-separated pool; the Worker round-robins across it. The secret is live immediately (the command creates a new version).

Check it with `curl https://sigil-render.<your-subdomain>.workers.dev/health`, then try a card.

### 4. Point the studio at it

`apps/studio` reads `VITE_RENDER_API_URL` at build time. Set it in the Vercel project (Settings → Environment Variables) to the Worker URL above, then redeploy the studio. Without it the studio runs on demo data and the export panel warns that the copied URLs are not live.

### Custom domain

`wrangler.toml` has no `routes` entry, so the Worker uses the `workers.dev` URL. To serve it from a domain you own, add:

```toml
routes = [{ pattern = "cards.example.com", custom_domain = true }]
```

then set `VITE_RENDER_API_URL` to that origin. Note that `sigil.dev` is currently parked on Afternic nameservers and is not controlled by this project; do not point embeds at it unless you own the domain.

## Cache behavior

| What                    | Where                      | TTL                                    |
| ----------------------- | -------------------------- | -------------------------------------- |
| Rendered SVG            | Cloudflare Cache API + CDN | 5 min (`stale-while-revalidate=86400`) |
| Normalized snapshot     | Cloudflare Cache API       | 4 hours fresh, 7 days retained         |
| Stale snapshot response | Not cached                 | `no-store`                             |

The cache is per-colo, so a cold colo pays one GitHub round trip. Refreshes are deduped per login within an isolate.
