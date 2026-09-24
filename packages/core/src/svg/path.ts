export type Point = readonly [number, number];

const r1 = (n: number) => String(Math.round(n * 10) / 10);

/**
 * Fritsch–Carlson monotone cubic interpolation as an SVG path.
 * Points must be sorted by x. The curve never overshoots the data.
 */
export function monotonePath(points: readonly Point[]): string {
  const n = points.length;
  if (n === 0) return "";
  const x = points.map((p) => p[0]);
  const y = points.map((p) => p[1]);
  const at = (a: number[], i: number) => a[i] ?? 0;
  if (n < 3) return points.map((p, i) => `${i ? "L" : "M"}${r1(p[0])},${r1(p[1])}`).join("");

  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(at(x, i + 1) - at(x, i));
    m.push(dx[i] ? (at(y, i + 1) - at(y, i)) / at(dx, i) : 0);
  }
  const t: number[] = [at(m, 0)];
  for (let i = 1; i < n - 1; i++) {
    const a = at(m, i - 1);
    const b = at(m, i);
    t.push(a * b <= 0 ? 0 : (a + b) / 2);
  }
  t.push(at(m, n - 2));
  for (let i = 0; i < n - 1; i++) {
    const mi = at(m, i);
    if (mi === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = at(t, i) / mi;
    const b = at(t, i + 1) / mi;
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      t[i] = tau * a * mi;
      t[i + 1] = tau * b * mi;
    }
  }

  let d = `M${r1(at(x, 0))},${r1(at(y, 0))}`;
  for (let i = 0; i < n - 1; i++) {
    const h = at(dx, i) / 3;
    d += `C${r1(at(x, i) + h)},${r1(at(y, i) + at(t, i) * h)} ${r1(at(x, i + 1) - h)},${r1(
      at(y, i + 1) - at(t, i + 1) * h,
    )} ${r1(at(x, i + 1))},${r1(at(y, i + 1))}`;
  }
  return d;
}
