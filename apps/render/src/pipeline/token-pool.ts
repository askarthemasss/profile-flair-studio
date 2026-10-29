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
