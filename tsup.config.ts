import { defineConfig } from "tsup";

export default defineConfig([
  {
    name: "core-module",
    entry: {
      index: "src/index.ts",
    },
    format: ["esm", "cjs"],
    dts: {
      entry: {
        index: "src/index.ts",
      },
    },
    sourcemap: true,
    minify: false,
    clean: true,
    outDir: "dist",
    target: "es2019",
    platform: "browser",
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".js" : ".cjs",
      };
    },
  },
  {
    name: "core-iife",
    entry: {
      "baseformusic-widget": "src/index.ts",
    },
    format: ["iife"],
    dts: false,
    sourcemap: true,
    minify: false,
    clean: false,
    globalName: "B4MFunnel",
    outDir: "dist",
    target: "es2019",
    platform: "browser",
    outExtension() {
      return {
        js: ".umd.js",
      };
    },
  },
  {
    name: "react",
    entry: {
      react: "src/react/B4MFunnelReact.tsx",
    },
    format: ["esm", "cjs"],
    dts: {
      entry: {
        react: "src/react/B4MFunnelReact.tsx",
      },
    },
    sourcemap: true,
    minify: false,
    clean: false,
    outDir: "dist",
    target: "es2019",
    platform: "browser",
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".js" : ".cjs",
      };
    },
  },
]);
