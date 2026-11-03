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

Create a Cloudflare API token with **Workers Scripts: Edit** and copy your account ID.

Add both as GitHub repository secrets so `.github/workflows/deploy.yml` can deploy on push to `main`:

| Secret                  | Where to find it                                    |
| ----------------------- | --------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare dashboard → My Profile → API Tokens      |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Account ID |

Without `CLOUDFLARE_API_TOKEN` the deploy step is skipped, which is why `main` can be green while no Worker exists.

### 3. Worker secrets

`wrangler deploy` does not set secrets. From `apps/render`, run each once:

```bash
pnpm exec wrangler secret put GITHUB_TOKEN               # classic PAT with public_repo read, or a fine-grained token with public read
pnpm exec wrangler secret put SUPABASE_URL               # https://<project>.supabase.co
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY  # server-side only
```

`GITHUB_TOKEN` may be a comma-separated pool; the Worker round-robins across it.

### 4. Deploy

```bash
pnpm --filter @sigil/render deploy
```

The Worker name is `sigil-render`, so by default it lands at:

```
https://sigil-render.<your-subdomain>.workers.dev
```

### 5. Point the studio at it

`apps/studio` reads `VITE_RENDER_API_URL` at build time. Set it in the Vercel project (Settings → Environment Variables) to the Worker URL above, then redeploy the studio. Without it the studio runs on demo data and the export panel warns that the copied URLs are not live.

### Custom domain

`wrangler.toml` has no `routes` entry, so the Worker uses the `workers.dev` URL. To serve it from a domain you own, add:

```toml
routes = [{ pattern = "cards.example.com", custom_domain = true }]
```

then set `VITE_RENDER_API_URL` to that origin. Note that `sigil.dev` is currently parked on Afternic nameservers and is not controlled by this project; do not point embeds at it unless you own the domain.
