/**
 * Snapshot cache for the render Worker.
 *
 * There is no database. Snapshots live in two layers:
 *
 * 1. The Cloudflare Cache API, shared by every isolate in a colo. This is the
 *    layer that survives isolate restarts, but it only works on custom domains
 *    (and Pages), not on `*.workers.dev`.
 * 2. A bounded in-isolate `Map`, always enabled. It keeps a warm isolate from
 *    re-fetching GitHub on every request when the Cache API is unavailable,
 *    which is the documented `workers.dev` default.
 *
 * Both layers use the same TTL, longer than the 4 hour freshness window, so a
 * stale copy is still readable while a refresh runs in the background.
 */
import type { GithubSnapshot } from "@sigil/core";
import type { SnapshotCache } from "./refresh-snapshot.js";

/** Synthetic origin so cache keys never collide with real request URLs. */
const CACHE_ORIGIN = "https://sigil.internal";

/**
 * Must exceed the 4 hour freshness window, otherwise a stale entry would be
 * evicted before it can be served.
 */
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const CACHE_TTL_SECONDS = CACHE_TTL_MS / 1000;

/** Upper bound on the in-isolate layer, so a busy colo cannot grow forever. */
const MEMORY_LIMIT = 500;

interface CachedSnapshot {
  snapshot: GithubSnapshot;
  fetchedAt: number;
}

/** Insertion-ordered, so the first key is always the oldest write. */
const memory = new Map<string, CachedSnapshot>();

function memoryKey(login: string): string {
  return login.toLowerCase();
}

function readMemory(login: string): CachedSnapshot | null {
  const key = memoryKey(login);
  const entry = memory.get(key);
  if (!entry) return null;

  // Expire lazily; the Cache API has its own TTL, this one is ours.
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    memory.delete(key);
    return null;
  }
  return entry;
}

function writeMemory(login: string, entry: CachedSnapshot): void {
  const key = memoryKey(login);
  // Re-insert so the entry moves to the newest position.
  memory.delete(key);
  memory.set(key, entry);

  while (memory.size > MEMORY_LIMIT) {
    const oldest = memory.keys().next().value;
    if (oldest === undefined) break;
    memory.delete(oldest);
  }
}

function deleteMemory(login: string): void {
  memory.delete(memoryKey(login));
}

function cacheKey(login: string): Request {
  return new Request(`${CACHE_ORIGIN}/snapshots/${encodeURIComponent(login.toLowerCase())}`);
}

/**
 * The colo-local Cache API, or `undefined` where it does not work (tests,
 * `*.workers.dev`). Callers must treat the result as optional.
 */
export function getDefaultCache(): Cache | undefined {
  try {
    return typeof caches === "undefined" ? undefined : caches.default;
  } catch {
    return undefined;
  }
}

/**
 * Build a snapshot cache over the Cache API plus the in-isolate layer.
 *
 * `cache` is optional: pass `undefined` to run on the memory layer alone.
 */
export function createEdgeSnapshotCache(
  cache: Cache | undefined = getDefaultCache(),
): SnapshotCache {
  return {
    async get(login) {
      if (cache) {
        try {
          const cached = await cache.match(cacheKey(login));
          if (cached) {
            const body = (await cached.json()) as CachedSnapshot;
            if (body?.snapshot && typeof body.fetchedAt === "number") {
              // Warm the isolate layer so later requests skip the Cache API.
              writeMemory(login, body);
              return body;
            }
          }
        } catch {
          // A malformed entry or an unavailable Cache API is not fatal; the
          // memory layer below still answers.
        }
      }

      return readMemory(login);
    },

    async put(login, snapshot) {
      const body: CachedSnapshot = { snapshot, fetchedAt: Date.now() };
      writeMemory(login, body);

      if (!cache) return;

      try {
        await cache.put(
          cacheKey(login),
          new Response(JSON.stringify(body), {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
            },
          }),
        );
      } catch {
        // `put` is best effort: the snapshot is already in memory.
      }
    },

    async delete(login) {
      deleteMemory(login);

      if (!cache) return;

      try {
        await cache.delete(cacheKey(login));
      } catch {
        // Nothing to do; the memory entry is gone.
      }
    },
  };
}

/** Test-only: clear the in-isolate layer between cases. */
export function clearMemorySnapshotCache(): void {
  memory.clear();
}
