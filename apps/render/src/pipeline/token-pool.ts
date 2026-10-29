export class TokenPool {
  private readonly tokens: string[];
  private currentIndex = 0;

  constructor(tokenCsv?: string) {
    this.tokens = tokenCsv
      ? tokenCsv
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Start each isolate at a different token so traffic is spread across the
    // whole pool instead of always hitting index zero.
    if (this.tokens.length > 0) {
      this.currentIndex = Math.floor(Math.random() * this.tokens.length);
    }
  }

  getToken(): string | null {
    if (this.tokens.length === 0) return null;
    const token = this.tokens[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.tokens.length;
    return token ?? null;
  }

  get size(): number {
    return this.tokens.length;
  }
}

const poolCache = new Map<string, TokenPool>();

/**
 * Returns a shared TokenPool for a token CSV. Reusing the instance keeps the
 * round-robin cursor across requests in the same Workers isolate; creating a
 * pool per request would always hand out the first token.
 */
export function getTokenPool(tokenCsv?: string): TokenPool {
  const key = tokenCsv ?? "";
  if (!key) return new TokenPool();

  let pool = poolCache.get(key);
  if (!pool) {
    pool = new TokenPool(key);
    poolCache.set(key, pool);
  }
  return pool;
}
