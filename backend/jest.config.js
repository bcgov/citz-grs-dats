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
		"rabbit/queue.ts",
		"s3/utils/connection.ts",
	],
	coverageDirectory: "coverage",
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
		prefix: "<rootDir>/",
	}),
};
