import fs from "node:fs";
import { resolve } from "node:path";

/**
 * This script updates the version number in your package.json file.
 * It supports only updating the version by major, minor, or patch increments.
 *
 * Usage:
 *   node bump-version.mjs <releaseType>
 *
 * releaseType:
 *   - major: Increments the major version and resets minor and patch to 0.
 *   - minor: Increments the minor version and resets the patch to 0.
 *   - patch: Increments the patch version.
 *
 * Example:
 *   node bump-version.mjs patch
 */

// Parse and validate version numbers
const parseVersion = (version) => {
	const parts = version.split(".");
	if (parts.length !== 3 || parts.some((part) => Number.isNaN(Number(part)))) {
		throw new Error("Invalid version number");
	}
	return parts.map(Number);
};

// Bump the version
const bumpVersion = (version, releaseType) => {
	let [major, minor, patch] = parseVersion(version);

	switch (releaseType) {
		case "major":
			major += 1;
			minor = 0;
			patch = 0;
			break;
		case "minor":
			minor += 1;
			patch = 0;
			break;
		case "patch":
			patch += 1;
			break;
		default:
			throw new Error('Invalid release type. Use "major", "minor", or "patch".');
	}

	return [major, minor, patch].join(".");
};

// Update package.json
const main = (releaseType) => {
	const packagePath = resolve(process.cwd(), "package.json");

	if (!fs.existsSync(packagePath)) {
		console.error("package.json not found!");
		process.exit(1);
	}

	const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
	const oldVersion = packageJson.version;

	try {
		const newVersion = bumpVersion(oldVersion, releaseType);
		packageJson.version = newVersion;

		fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
		console.log(`\nVersion updated from ${oldVersion} to ${newVersion}\n`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

// Get the release type from the command line arguments
const [releaseType] = process.argv.slice(2); // "major" | "minor" | "patch"

if (!releaseType || !["major", "minor", "patch"].includes(releaseType)) {
	console.error("Usage: node bump-version.mjs <releaseType>");
	console.error('releaseType: "major", "minor", or "patch"');
	process.exit(1);
}

main(releaseType);
