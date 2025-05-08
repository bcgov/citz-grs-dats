/** @type {import('ts-jest').JestConfigWithTsJest} */
const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	moduleFileExtensions: ["ts", "js"],
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	testMatch: ["**/tests/**/*.test.ts"],
	collectCoverage: true,
	collectCoverageFrom: ["src/**/*.ts"],
	coveragePathIgnorePatterns: [
		"index.ts",
		"express.ts",
		"config/",
		"modules/ches/utils/",
		"modules/rabbit/utils/",
		"modules/s3/utils/",
		"modules/filelist/services/",
		"modules/filelist/utils/",
		"modules/transfer/services/",
		"modules/transfer/controllers",
		"modules/transfer/utils/",
		"modules/submission-agreement/assets/",
		"modules/submission-agreement/utils/",
		"utils/logs",
		"utils/generateChecksum",
		"utils/writeStreamToTempFile",
		"utils/base64",
	],
	coverageDirectory: "coverage",
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
		prefix: "<rootDir>/",
	}),
};
