import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    dts: true,
    entryPoints: ["src/mod.ts"],
    outDir: "dist",
    format: ["esm", "cjs"],
    minify: false,
    keepNames: true,
    skipNodeModulesBundle: true,
    sourcemap: true,
    target: ["es2015"]
});
