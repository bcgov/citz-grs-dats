import { Readable } from "node:stream";
import { streamToBuffer } from "@/utils/streamToBuffer";

describe("streamToBuffer", () => {
	// Test case: Convert a stream with multiple chunks to a buffer
	it("should convert a stream with multiple chunks to a single buffer", async () => {
		const data = ["Hello, ", "world!"];
		const mockStream = Readable.from(data.map((chunk) => Buffer.from(chunk)));

		const result = await streamToBuffer(mockStream);

		expect(result).toBeInstanceOf(Buffer);
		expect(result.toString()).toBe("Hello, world!");
	});

	// Test case: Convert an empty stream to an empty buffer
	it("should convert an empty stream to an empty buffer", async () => {
		const mockStream = Readable.from([]);

		const result = await streamToBuffer(mockStream);

		expect(result).toBeInstanceOf(Buffer);
		expect(result.length).toBe(0);
	});

	// Test case: Handle an error thrown in the stream
	it("should reject if the stream emits an error", async () => {
		const mockStream = new Readable({
			read() {
				this.emit("error", new Error("Stream error"));
			},
		});

		await expect(streamToBuffer(mockStream)).rejects.toThrow("Stream error");
	});

	// Test case: Convert a stream with a single chunk to a buffer
	it("should convert a stream with a single chunk to a buffer", async () => {
		const data = ["Single chunk"];
		const mockStream = Readable.from(data.map((chunk) => Buffer.from(chunk)));

		const result = await streamToBuffer(mockStream);

		expect(result).toBeInstanceOf(Buffer);
		expect(result.toString()).toBe("Single chunk");
	});
});
