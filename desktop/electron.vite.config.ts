import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src"),
        "@preload": resolve("src/preload"),
        "@renderer": resolve("src/renderer"),
      },
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        // keep well under Windows handle limit
        maxParallelFileOps: 20, // 10-40 is usually safe
      },
    },
  },
});
