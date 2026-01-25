import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],

  format: ["esm", "cjs"],
  target: "es2018",

  dts: true,
  sourcemap: true,
  bundle: true,
  splitting: false,

  treeshake: true,
  minify: false,
  keepNames: true,
  clean: true,
});
