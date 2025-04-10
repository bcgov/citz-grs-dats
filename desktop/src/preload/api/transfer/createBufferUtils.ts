import { Buffer } from "node:buffer";

export const createBufferUtils = () => {
  return {
    from: (data: ArrayBuffer | Uint8Array | number[]): Buffer => {
      if (Array.isArray(data)) {
        return Buffer.from(data);
      }

      if (data instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(data));
      }

      return Buffer.from(data); // Uint8Array is fine here
    },
    isBuffer: (value: unknown): value is Buffer => {
      return Buffer.isBuffer(value);
    },
    normalize: (input: unknown): Buffer => {
      if (Buffer.isBuffer(input)) return input;

      let result: unknown;

      if (input instanceof Uint8Array) {
        result = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
      } else if (
        typeof input === "object" &&
        input !== null &&
        "type" in input &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (input as any).type === "Buffer" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        Array.isArray((input as any).data)
      ) {
        result = Buffer.from(
          (input as { type: "Buffer"; data: number[] }).data
        );
      } else {
        throw new Error(`Invalid buffer input: ${JSON.stringify(input)}`);
      }

      // ✨ Ensure it's truly a Buffer instance
      if (!Buffer.isBuffer(result)) {
        throw new Error("Normalization failed: result is not a Buffer");
      }

      return result;
    },
  };
};
