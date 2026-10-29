/**
 * WebCrypto AES-GCM token encryption for Cloudflare Workers.
 */

async function getKey(secretHex: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  // Ensure 32 bytes (256 bits)
  const keyBytes = new Uint8Array(32);
  const sourceBytes = enc.encode(secretHex);
  keyBytes.set(sourceBytes.subarray(0, 32));

  return await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptToken(token: string, secretKey: string): Promise<string> {
  const key = await getKey(secretKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(token);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptToken(encryptedBase64: string, secretKey: string): Promise<string> {
  const key = await getKey(secretKey);
  const binary = atob(encryptedBase64);
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i);
  }

  const iv = combined.subarray(0, 12);
  const data = combined.subarray(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  return new TextDecoder().decode(decrypted);
}
