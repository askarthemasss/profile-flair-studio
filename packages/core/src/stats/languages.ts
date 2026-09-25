import type { LanguageStat, RepoSummary } from "../github/types";

/** Sum bytes across owned non-fork repos. Archived repos are excluded only when hideArchived. */
export function aggregateLanguages(
  repos: RepoSummary[],
  options: { hideArchived?: boolean } = {},
): LanguageStat[] {
  const totals = new Map<string, { color: string | null; bytes: number }>();
  for (const repo of repos) {
    if (options.hideArchived && repo.archived) continue;
    for (const lang of repo.languages) {
      const t = totals.get(lang.name) ?? { color: lang.color, bytes: 0 };
      t.bytes += lang.bytes;
      totals.set(lang.name, t);
    }
  }
  const all = [...totals].reduce((s, [, t]) => s + t.bytes, 0);
  return [...totals]
    .filter(([, t]) => t.bytes > 0)
    .map(([name, t]) => ({ name, color: t.color, bytes: t.bytes, pct: all ? (100 * t.bytes) / all : 0 }))
    .sort((a, b) => b.bytes - a.bytes);
}
