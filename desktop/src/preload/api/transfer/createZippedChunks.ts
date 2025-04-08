import archiver from "archiver";
import path from "node:path";
import { PassThrough, Readable } from "node:stream";
import { createChecksumHasher } from "./createChecksumHasher";

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB

export const createZippedChunks = async (
  folders: Record<string, FileBufferObj[]>
): Promise<{ chunks: Uint8Array[]; checksum: string }> => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const zipOutput = new PassThrough();
  archive.pipe(zipOutput);

  for (const [folder, files] of Object.entries(folders)) {
    for (const { path: filePath, buffer } of files) {
      const zipPath = `${folder}${path.posix.normalize(filePath)}`;
      const stream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });

      archive.append(stream, { name: zipPath });
    }
  }

  archive.finalize();

  const chunks: Uint8Array[] = [];
  const hasher = createChecksumHasher();

  const bufferQueue: Buffer[] = [];
  let bufferedSize = 0;

  for await (const chunk of zipOutput) {
    bufferQueue.push(Buffer.from(chunk));
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

      const bigChunk = Buffer.concat(
        buffersToConcat as unknown as Uint8Array[],
        chunkSize
      );
      hasher.update(bigChunk);
      chunks.push(new Uint8Array(bigChunk));
      bufferedSize -= chunkSize;
    }
  }

  // Push any remaining buffer as the last chunk
  if (bufferQueue.length > 0) {
    const finalChunk = Buffer.concat(
      bufferQueue as unknown as Uint8Array[],
      bufferedSize
    );
    hasher.update(finalChunk);
    chunks.push(new Uint8Array(finalChunk));
  }

  return {
    chunks,
    checksum: hasher.digest(),
  };
};
