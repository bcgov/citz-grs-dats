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
		"modules/filelist/utils/queueConsumer",
		"modules/transfer/services/",
		"modules/transfer/controllers",
		"modules/transfer/utils/queueConsumer",
		"modules/transfer/utils/getMetadata",
		"modules/transfer/utils/addFileToZipBuffer",
		"modules/transfer/utils/getFilenameByRegex",
		"modules/transfer/utils/email",
		"modules/transfer/utils/getFileFromZipBuffer",
		"modules/transfer/utils/getMetadata",
		"modules/transfer/utils/createPSP",
		"modules/transfer/utils/getFilenameByRegex",
		"modules/transfer/utils/addFileToZipBuffer",
		"modules/transfer/utils/createFinalTransfer",
		"modules/transfer/utils/validateContentMatchesMetadata",
		"modules/transfer/utils/validateSubmissionAgreement",
		"modules/transfer/utils/validateMetadataFoldersMatchesFiles",
		"modules/transfer/utils/createStandardTransferZip",
		"modules/submission-agreement/assets/",
		"utils/logs",
	],
	coverageDirectory: "coverage",
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
		prefix: "<rootDir>/",
	}),
};
