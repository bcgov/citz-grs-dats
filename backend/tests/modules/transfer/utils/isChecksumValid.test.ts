import { Readable } from "node:stream";
import crypto from "node:crypto";
import yauzl from "yauzl";
import { isChecksumValid } from "@/modules/transfer/utils/isChecksumValid";
import { HttpError, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";

jest.mock("yauzl");

const filePath = "path/inside/zip.txt";
const zipBuffer = Buffer.from("fake-zip-content"); // Mock buffer for zip testing
const validChecksum = crypto.createHash("sha256").update("valid-content").digest("hex");
const invalidChecksum = "invalid-checksum";

interface MockZipFile extends Partial<yauzl.ZipFile> {
	entryCallback?: ((entry: yauzl.Entry) => void) | undefined;
	endCallback?: (() => void) | undefined;
}

// Mock yauzl.ZipFile behavior
const mockZipFile: MockZipFile = {
	entryCallback: undefined,
	endCallback: undefined,
	on: jest.fn().mockImplementation(function (this: MockZipFile, event, callback) {
		if (event === "entry") {
			this.entryCallback = callback;
		} else if (event === "end") {
			this.endCallback = callback;
		}
	}),
	readEntry: jest.fn().mockImplementation(function (this: MockZipFile) {
		// Simulate triggering the `entry` event only once
		if (this.entryCallback) {
			const entryCallback = this.entryCallback;
			this.entryCallback = undefined; // Prevent re-triggering
			entryCallback({ fileName: filePath } as yauzl.Entry);
		} else if (this.endCallback) {
			// Trigger the `end` event after all entries have been processed
			const endCallback = this.endCallback;
			this.endCallback = undefined; // Prevent re-triggering
			endCallback();
		}
	}),
	openReadStream: jest.fn(
		(
			entry: yauzl.Entry,
			optionsOrCallback: yauzl.ZipFileOptions | ((err: Error | null, stream: Readable) => void),
			callback?: (err: Error | null, stream: Readable) => void,
		) => {
			const cb = typeof optionsOrCallback === "function" ? optionsOrCallback : callback;
			if (!cb) return;

			if (entry.fileName === filePath) {
				const stream = Readable.from([Buffer.from("valid-content")]);
				cb(null, stream);
			} else {
				cb(new Error("File not found"), undefined as unknown as Readable);
			}
		},
	),
	close: jest.fn(),
};

describe("isChecksumValid", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(yauzl.fromBuffer as jest.Mock).mockImplementation((buffer, options, callback) => {
			callback(null, mockZipFile as yauzl.ZipFile);
		});
	});

	// Test case: Valid checksum for a buffer
	it("should return true for a valid checksum for the entire buffer", async () => {
		const buffer = Buffer.from("valid-content");
		const result = await isChecksumValid({ buffer, checksum: validChecksum });
		expect(result).toBe(true);
	});

	// Test case: Invalid checksum for a buffer
	it("should return false for an invalid checksum for the entire buffer", async () => {
		const buffer = Buffer.from("valid-content");
		const result = await isChecksumValid({ buffer, checksum: invalidChecksum });
		expect(result).toBe(false);
	});

	// Test case: Valid checksum for a file inside the zip
	it("should return true for a valid checksum for a file inside the zip", async () => {
		const result = await isChecksumValid({ buffer: zipBuffer, checksum: validChecksum, filePath });
		expect(result).toBe(true);
	});

	// Test case: File not found in the zip
	it("should throw an HttpError if the file is not found in the zip", async () => {
		const nonExistentPath = "nonexistent/file.txt";

		await expect(
			isChecksumValid({
				buffer: zipBuffer,
				checksum: validChecksum,
				filePath: nonExistentPath,
			}),
		).rejects.toThrow(
			new HttpError(
				HTTP_STATUS_CODES.NOT_FOUND,
				`File at path "${nonExistentPath}" not found in the zip buffer.`,
			),
		);
	});

	// Test case: Invalid zip buffer
	it("should throw an HttpError for an invalid zip buffer", async () => {
		(yauzl.fromBuffer as jest.Mock).mockImplementation((buffer, options, callback) => {
			callback(new Error("Invalid zip"), null);
		});

		await expect(
			isChecksumValid({
				buffer: Buffer.from("invalid-content"),
				checksum: validChecksum,
				filePath,
			}),
		).rejects.toThrow(
			new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Provided buffer is not a valid zip file."),
		);
	});

	// Test case: Error reading a file inside the zip
	it("should throw an HttpError if there is an error reading a file in the zip", async () => {
		(mockZipFile.openReadStream as jest.Mock).mockImplementationOnce(
			(
				entry: yauzl.Entry,
				optionsOrCallback:
					| yauzl.ZipFileOptions
					| ((err: Error | null, stream: Readable | null) => void),
				callback?: (err: Error | null, stream: Readable | null) => void,
			) => {
				const cb = typeof optionsOrCallback === "function" ? optionsOrCallback : callback;
				if (cb) cb(new Error("Stream error"), null);
			},
		);

		await expect(
			isChecksumValid({ buffer: zipBuffer, checksum: validChecksum, filePath }),
		).rejects.toThrow(
			new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, `Error reading file at path "${filePath}".`),
		);
	});
});
