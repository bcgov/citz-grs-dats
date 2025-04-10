import archiver from "archiver";
import unzipper from "unzipper";
import { PassThrough } from "node:stream";

// Define the Props type
type Props = {
  contentZipBuffer: Buffer;
  documentation: Record<string, Buffer | null>;
  metadata: Record<string, Buffer | null>;
};

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB

// Extract zip contents using unzipper and re-add to archive
const extractZipToArchive = async (
  zipBuffer: Buffer,
  archive: archiver.Archiver
) => {
  const directory = await unzipper.Open.buffer(zipBuffer);

  for (const file of directory.files) {
    if (file.type === "File") {
      const stream = file.stream();
      archive.append(stream, { name: `content/${file.path}` });
    }
  }
};

// Create archive in-memory using chunked streaming
export const createStandardTransferZip = async ({
  contentZipBuffer,
  documentation,
  metadata,
}: Props): Promise<Buffer> => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const zipOutput = new PassThrough();
  archive.pipe(zipOutput);

  // Extract content zip entries into new zip under 'content/'
  await extractZipToArchive(contentZipBuffer, archive);

  // Add documentation files
  for (const [filename, buffer] of Object.entries(documentation)) {
    if (buffer) archive.append(buffer, { name: `documentation/${filename}` });
  }

  // Add metadata files
  for (const [filename, buffer] of Object.entries(metadata)) {
    if (buffer) archive.append(buffer, { name: `metadata/${filename}` });
  }

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
