import type { GithubSnapshot, LanguageStat } from "../types.js";

export interface LanguageShare {
  name: string;
  color: string | null;
  bytes: number;
  pct: number;
}

/**
 * Derive ranked language shares from a snapshot.
 *
 * @param snapshot   The full GithubSnapshot
 * @param maxLangs   Max languages to include (default 8)
 * @param hideNames  Language names to exclude (case-insensitive)
 */
export function computeLanguageShares(
  snapshot: GithubSnapshot,
  maxLangs = 8,
  hideNames: string[] = [],
): LanguageShare[] {
  const hideLower = new Set(hideNames.map((n) => n.toLowerCase()));

  const filtered: LanguageStat[] = snapshot.languages.filter(
    (l) => !hideLower.has(l.name.toLowerCase()),
  );

  const top = filtered.slice(0, maxLangs);
  const total = top.reduce((sum, l) => sum + l.bytes, 0);

  if (total === 0) return [];

  return top.map((l) => ({
    name: l.name,
    color: l.color,
    bytes: l.bytes,
    pct: Math.round((l.bytes / total) * 1000) / 10,
  }));
}
