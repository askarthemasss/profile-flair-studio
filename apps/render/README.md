# Sigil render Worker

Edge API that renders SVG cards and serves normalized snapshots.

- `GET /c/:kind/:user` — SVG card
- `GET /snapshot/:user` — normalized snapshot JSON
- `GET /themes` — builtin themes
- `GET /health` — status and API version

Every route is also available under `/v1`. See `apps/studio/src/pages/docs.tsx` for the public docs.

## Deploy

### 1. Supabase

Create a project, then run `supabase/migrations/0001_init.sql` in the SQL editor (or `supabase db push`). It creates the `snapshots` table used as the shared cache.

### 2. Cloudflare credentials

Create a Cloudflare API token from the **Edit Cloudflare Workers** template, then copy your account ID.

Add both as GitHub repository secrets so `.github/workflows/deploy.yml` can deploy on push to `main`:

| Secret                  | Where to find it                                    |
| ----------------------- | --------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare dashboard → My Profile → API Tokens      |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Account ID |

Without `CLOUDFLARE_API_TOKEN` the deploy step is skipped, which is why `main` can be green while no Worker exists.

If the very first deploy fails with an authorization error, the token cannot create a new Worker: either create an empty `sigil-render` Worker once in the dashboard, or grant the token Workers Admin for that first run.

### 3. Deploy

The first deploy must happen before the secrets in step 4, because `wrangler secret put` targets an existing Worker.

Either push to `main` (with the secrets from step 2 in place) or deploy locally after `wrangler login`:

```bash
pnpm --filter @sigil/render deploy
```

The Worker name is `sigil-render`, so by default it lands at:

```
https://sigil-render.<your-subdomain>.workers.dev
```

### 4. Worker secrets

`wrangler deploy` does not set secrets. With the Worker now deployed, run each once from `apps/render`:

```bash
pnpm exec wrangler secret put GITHUB_TOKEN               # classic PAT with public_repo read, or a fine-grained token with public read
pnpm exec wrangler secret put SUPABASE_URL               # https://<project>.supabase.co
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY  # server-side only
```

Each command creates a new Worker version, so the secrets are live immediately. `GITHUB_TOKEN` may be a comma-separated pool; the Worker round-robins across it.

Check it with `curl https://sigil-render.<your-subdomain>.workers.dev/health`, then try a card.

### 5. Point the studio at it

`apps/studio` reads `VITE_RENDER_API_URL` at build time. Set it in the Vercel project (Settings → Environment Variables) to the Worker URL above, then redeploy the studio. Without it the studio runs on demo data and the export panel warns that the copied URLs are not live.

### Custom domain

`wrangler.toml` has no `routes` entry, so the Worker uses the `workers.dev` URL. To serve it from a domain you own, add:

```toml
routes = [{ pattern = "cards.example.com", custom_domain = true }]
```

then set `VITE_RENDER_API_URL` to that origin. Note that `sigil.dev` is currently parked on Afternic nameservers and is not controlled by this project; do not point embeds at it unless you own the domain.
