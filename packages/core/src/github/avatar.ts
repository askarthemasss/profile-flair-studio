const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_BYTES = 64 * 1024;
const cache = new Map<string, { uri: string; at: number }>();

/** Fetch an avatar once, inline it as base64, and cache it for 24 h. Null on failure. */
export async function fetchAvatarDataUri(
  url: string,
  fetchImpl: typeof fetch = fetch,
  now = Date.now(),
): Promise<string | null> {
  const hit = cache.get(url);
  if (hit && now - hit.at < TTL_MS) return hit.uri;
  try {
    const res = await fetchImpl(url, { headers: { "User-Agent": "Sigil" } });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") ?? "image/png").split(";")[0]!.trim();
    if (!type.startsWith("image/")) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) return null;
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    const uri = `data:${type};base64,${btoa(binary)}`;
    cache.set(url, { uri, at: now });
    if (cache.size > 500) cache.delete(cache.keys().next().value as string);
    return uri;
  } catch {
    return null;
  }
}
