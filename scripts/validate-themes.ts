import fs from "node:fs";
import path from "node:path";
import { ThemeSchema } from "../packages/core/src/types.js";
import { passesAccentContrast, passesTextContrast } from "../packages/core/src/color.js";

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

      const { bg, text, accent } = parsed.data.colors;

      if (!passesTextContrast(text, bg)) {
        console.error(
          `❌ ${file}: text (${text}) on background (${bg}) does not meet WCAG AA 4.5:1.`,
        );
        hasErrors = true;
      }

      if (!passesAccentContrast(accent, bg)) {
        console.error(
          `❌ ${file}: accent (${accent}) on background (${bg}) does not meet WCAG AA 3:1.`,
        );
        hasErrors = true;
      }

      console.log(`✓ Theme ${file} validated successfully.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ Error reading theme file ${file}: ${message}`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log("All themes validated successfully.");
}
