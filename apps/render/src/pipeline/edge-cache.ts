/**
 * Edge snapshot cache backed by the Cloudflare Cache API.
 *
 * There is no database: normalized snapshots live in the per-colo edge cache
 * with a TTL longer than the freshness window, so a stale copy is still
 * readable while a refresh runs in the background.
 */
import type { GithubSnapshot } from "@sigil/core";
import type { SnapshotCache } from "./refresh-snapshot.js";

/** Synthetic origin so cache keys never collide with real request URLs. */
const CACHE_ORIGIN = "https://sigil.internal";

/**
 * Must exceed the 4 hour freshness window, otherwise a stale entry would be
 * evicted before it can be served.
 */
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;

interface CachedSnapshot {
  snapshot: GithubSnapshot;
  fetchedAt: number;
}

function cacheKey(login: string): Request {
  return new Request(`${CACHE_ORIGIN}/snapshots/${encodeURIComponent(login.toLowerCase())}`);
}

export function createEdgeSnapshotCache(cache: Cache): SnapshotCache {
  return {
    async get(login) {
      const cached = await cache.match(cacheKey(login));
      if (!cached) return null;

      try {
        const body = (await cached.json()) as CachedSnapshot;
        if (!body?.snapshot || typeof body.fetchedAt !== "number") return null;
        return body;
      } catch {
        return null;
      }
    },

    async put(login, snapshot) {
      const body: CachedSnapshot = { snapshot, fetchedAt: Date.now() };
      await cache.put(
        cacheKey(login),
        new Response(JSON.stringify(body), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
          },
        }),
      );
    },

    async delete(login) {
      await cache.delete(cacheKey(login));
    },
  };
}
