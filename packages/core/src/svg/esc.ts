const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escape a string for SVG text or attribute values and strip control characters.
 * Every string that comes from outside the code passes through here.
 */
export function esc(s: string): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/[&<>"']/g, (ch) => ENTITIES[ch] ?? ch);
}
