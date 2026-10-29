import fs from "node:fs";
import path from "node:path";
import { ThemeSchema } from "../packages/core/src/types.js";

function getLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return a[0]! * 0.2126 + a[1]! * 0.7152 + a[2]! * 0.0722;
}

function getContrast(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const themeDirs = [
  path.resolve("packages/core/src/themes/builtin"),
  path.resolve("themes/community"),
];

let hasErrors = false;

for (const dir of themeDirs) {
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const json = JSON.parse(raw);
      const parsed = ThemeSchema.safeParse(json);

      if (!parsed.success) {
        console.error(`❌ Validation failed for ${file}:`, parsed.error.format());
        hasErrors = true;
        continue;
      }

      // Check contrast ratio between background and text (WCAG AA >= 4.5:1)
      const contrast = getContrast(parsed.data.colors.bg, parsed.data.colors.text);
      if (contrast < 4.5) {
        console.warn(
          `⚠️ Low contrast in ${file} between bg (${parsed.data.colors.bg}) and text (${parsed.data.colors.text}): ${contrast.toFixed(2)}:1`,
        );
      }

      console.log(`✓ Theme ${file} validated successfully.`);
    } catch (err: any) {
      console.error(`❌ Error reading theme file ${file}:`, err.message);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log("All themes validated successfully.");
}
