import fs from "node:fs";
import { resolve } from "node:path";

/**
 * This script updates the release_notes.json file with notes on the new version.
 */

// Update resources/release_notes.json
const main = (newVersion, releaseNotes) => {
	const filePath = resolve(process.cwd(), "resources/release_notes.json");

	if (!fs.existsSync(filePath)) {
		console.error("release_notes.json not found!");
		process.exit(1);
	}

	const releaseNotesJson = JSON.parse(fs.readFileSync(filePath, "utf8"));

	try {
		releaseNotesJson[newVersion] = releaseNotes;

		fs.writeFileSync(filePath, `${JSON.stringify(releaseNotesJson, null, 2)}\n`);
		console.log(`\nRelease notes added for ${newVersion}\n`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

// Get the command line arguments
const [newVersion] = process.argv.slice(2);
const [releaseNotes] = process.argv.slice(3);

if (!newVersion || !releaseNotes) {
	console.error("Usage: node add-release-notes.js <newVersion> <releaseNotes>");
	process.exit(1);
}

main(newVersion, releaseNotes);
