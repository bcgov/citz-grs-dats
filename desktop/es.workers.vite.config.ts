import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import fs from 'node:fs';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Define an array of worker entry points
const workerEntries = fs
	.readdirSync(resolve(__dirname, 'src/main/fileProcessing/workers'))
	.filter((file) => file.endsWith('.ts'))
	.reduce(
		(entries, file) => {
			const name = file.replace('.ts', '');
			entries[name] = resolve(__dirname, `src/main/fileProcessing/workers/${file}`);
			return entries;
		},
		{} as Record<string, string>
	);

/**
 * Config used to build esmodule worker files in the out/es-workers directory.
 * These files are used when in development mode using 'npm run dev'.
 */

export default defineConfig({
	build: {
		lib: {
			entry: workerEntries, // Multiple entry points
			formats: ['es'], // Build as ESModule
			fileName: (format, entryName) => `${entryName}.js`, // Use entry name for output
		},
		outDir: 'out/es-workers', // Output directory
		rollupOptions: {
			external: ['worker_threads', 'fs', 'path', 'crypto'], // Externalize Node.js modules
		},
		target: 'node22',
		ssr: true,
		minify: false, // Disable minification to help with debugging
	},
	optimizeDeps: {
		exclude: ['fs', 'path'], // Exclude Node.js modules from optimization
	},
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: 'src/main/fileProcessing/workers/utilities/scripts/getExtendedMetadata.ps1',
					dest: 'scripts',
				},
			],
		}),
	],
});
