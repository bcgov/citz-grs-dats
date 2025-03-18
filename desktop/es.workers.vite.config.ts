import { defineConfig } from "vite";
import { resolve } from "node:path";
import fs from "node:fs";
import { viteStaticCopy } from "vite-plugin-static-copy";

// Get worker files
const workerEntries = fs
  .readdirSync(resolve(__dirname, "src/main/fileProcessing/workers"))
  .filter((file) => file.endsWith(".ts"))
  .reduce((entries, file) => {
    const name = `workers/${file.replace(".ts", "")}`;
    entries[name] = resolve(
      __dirname,
      `src/main/fileProcessing/workers/${file}`
    );
    return entries;
  }, {} as Record<string, string>);

// Get utility files
const utilityEntries = fs
  .readdirSync(resolve(__dirname, "src/main/fileProcessing/workers/utilities"))
  .filter((file) => file.endsWith(".ts"))
  .reduce((entries, file) => {
    const name = `utilities/${file.replace(".ts", "")}`;
    entries[name] = resolve(
      __dirname,
      `src/main/fileProcessing/workers/utilities/${file}`
    );
    return entries;
  }, {} as Record<string, string>);

// Merge worker and utility files into entries
const entries = { ...workerEntries, ...utilityEntries };

export default defineConfig({
  build: {
    lib: {
      entry: entries, // Multiple entry points for both workers and utilities
      formats: ["es"], // Output as ESModules
      fileName: (format, entryName) => `${entryName}.js`, // Keep original file name
    },
    outDir: "out/es-workers", // Output directory
    rollupOptions: {
      external: [
        "worker_threads",
        "fs",
        "path",
        "crypto",
        "child_process",
        "util",
      ], // Externalize Node.js built-in modules
    },
    target: "node22",
    ssr: true,
    minify: false, // Disable minification for debugging
  },
  optimizeDeps: {
    exclude: ["fs", "path"], // Prevent optimizing Node.js modules
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "src/main/fileProcessing/workers/utilities/scripts/getExtendedMetadata.ps1",
          dest: "scripts",
        },
        {
          src: "resources/release_notes.json",
          dest: "resources",
        },
      ],
    }),
  ],
});
