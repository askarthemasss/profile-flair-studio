/** Greedy word wrap by character count (mono). Ellipsis when text overflows `maxLines`. */
export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const width = Math.max(1, Math.floor(maxChars));
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (let word of words) {
    while (word.length > width) {
      if (line) lines.push(line);
      lines.push(word.slice(0, width));
      word = word.slice(width);
      line = "";
    }
    const next = line ? `${line} ${word}` : word;
    if (next.length <= width) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, Math.max(0, maxLines));
  const last = kept.length - 1;
  if (last >= 0) kept[last] = `${(kept[last] ?? "").slice(0, width - 1).trimEnd()}…`;
  return kept;
}

const UNITS = ["", "k", "M", "B", "T"];

/** 1234 → "1.2k", 1_500_000 → "1.5M". Never NaN. */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const sign = n < 0 ? "-" : "";
  let value = Math.abs(n);
  if (value < 1000) return sign + String(Math.round(value));
  let unit = 0;
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit++;
  }
  let rounded = Math.round(value * 10) / 10;
  if (rounded >= 1000 && unit < UNITS.length - 1) {
    rounded = 1;
    unit++;
  }
  return `${sign}${String(rounded).replace(/\.0$/, "")}${UNITS[unit]}`;
}

/** "3d ago" style time. `now` is always passed in, so renders stay deterministic. */
export function relativeTime(iso: string, now: string): string {
  const then = Date.parse(iso);
  const at = Date.parse(now);
  if (!Number.isFinite(then) || !Number.isFinite(at)) return "—";
  const seconds = Math.max(0, Math.round((at - then) / 1000));
  const steps: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [30, "d"],
    [12, "mo"],
  ];
  if (seconds < 45) return "just now";
  let value = seconds;
  for (const [size, label] of steps) {
    if (value < size) return `${value}${label} ago`;
    value = Math.floor(value / size);
  }
  return `${value}y ago`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-03-04" → "Mar 4". */
export function shortDate(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return m && d ? `${MONTHS[m - 1]} ${d}` : "—";
}

export function monthName(index: number): string {
  return MONTHS[((index % 12) + 12) % 12] ?? "";
}
