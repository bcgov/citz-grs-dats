import { defineConfig } from "vite";
import { resolve } from "node:path";
import fs from "node:fs";

// Define an array of worker entry points
const workerEntries = fs
	.readdirSync(resolve(__dirname, "src/main/fileProcessing/workers"))
	.filter((file) => file.endsWith(".ts"))
	.reduce(
		(entries, file) => {
			const name = file.replace(".ts", "");
			entries[name] = resolve(__dirname, `src/main/fileProcessing/workers/${file}`);
			return entries;
		},
		{} as Record<string, string>,
	);

/**
 * Config used to build commonjs worker files in the out/cjs-workers directory.
 * These files are added to the executable's program files when configured in the package.json build.
 */

export default defineConfig({
	build: {
		lib: {
			entry: workerEntries, // Multiple entry points
			formats: ["cjs"], // Build as CommonJS
			fileName: (format, entryName) => `${entryName}.js`, // Use entry name for output
		},
		outDir: "out/cjs-workers", // Output directory
		rollupOptions: {
			external: ["worker_threads", "fs", "path", "crypto"], // Externalize Node.js modules
		},
		target: "node22",
		ssr: true,
		minify: false, // Disable minification to help with debugging
	},
	optimizeDeps: {
		exclude: ["fs", "path"], // Exclude Node.js modules from optimization
	},
});
