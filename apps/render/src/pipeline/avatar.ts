/**
 * Fetches user avatar and returns base64 data URI.
 */
export async function fetchAvatarDataUri(avatarUrl: string): Promise<string | null> {
  if (!avatarUrl) return null;

  try {
    const res = await fetch(avatarUrl);
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }

    const base64 = btoa(binary);
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}
