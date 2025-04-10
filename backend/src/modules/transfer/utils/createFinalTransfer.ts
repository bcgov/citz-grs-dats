import archiver from "archiver";
import { PassThrough } from "node:stream";
import crypto from "node:crypto";

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB

export const createFinalTransfer = async (
  pspArray: { buffer: Buffer; schedule: string; classification: string }[]
): Promise<Buffer> => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const zipOutput = new PassThrough();
  archive.pipe(zipOutput);

  const manifestLines: string[] = [];

  // Append each PSP zip and add checksum
  for (const { buffer, schedule, classification } of pspArray) {
    const zipFileName = `PSP_${schedule}_${classification}.zip`;
    archive.append(buffer, { name: zipFileName });

    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
    manifestLines.push(`${checksum} ${zipFileName}`);
  }

  // Add the manifest file
  archive.append(manifestLines.join("\n"), { name: "manifest-sha256.txt" });
  archive.finalize();

  const chunkBuffers: Buffer[] = [];
  const bufferQueue: Buffer[] = [];
  let bufferedSize = 0;

  return new Promise((resolve, reject) => {
    zipOutput.on("data", (chunk: Buffer) => {
      bufferQueue.push(chunk);
      bufferedSize += chunk.length;

      while (bufferedSize >= CHUNK_SIZE) {
        let chunkSize = 0;
        const buffersToConcat: Buffer[] = [];

        while (bufferQueue.length && chunkSize < CHUNK_SIZE) {
          const next = bufferQueue[0];
          const remaining = CHUNK_SIZE - chunkSize;

          if (next.length <= remaining) {
            chunkSize += next.length;
            buffersToConcat.push(bufferQueue.shift()!);
          } else {
            buffersToConcat.push(next.slice(0, remaining));
            bufferQueue[0] = next.slice(remaining);
            chunkSize += remaining;
          }
        }

        chunkBuffers.push(Buffer.concat(buffersToConcat, chunkSize));
        bufferedSize -= chunkSize;
      }
    });

    zipOutput.on("end", () => {
      if (bufferQueue.length > 0) {
        chunkBuffers.push(Buffer.concat(bufferQueue, bufferedSize));
      }
      resolve(Buffer.concat(chunkBuffers));
    });

    zipOutput.on("error", (err) => reject(err));
  });
};
