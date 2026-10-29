import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/types.ts",
    "src/params.ts",
    "src/brand.ts",
    "src/color.ts",
    "src/themes/index.ts",
  ],
  format: ["esm"],
  dts: false,
  clean: false,
  splitting: false,
  sourcemap: true,
});
