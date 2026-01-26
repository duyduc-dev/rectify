import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],

  format: ["esm", "cjs"],
  target: "es2018",

  dts: true,
  sourcemap: true,
  bundle: true,
  splitting: true,

  treeshake: true,
  minify: true,
  keepNames: true,
  clean: true,
});
