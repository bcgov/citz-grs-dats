import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";
import {
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { logs } from "@/utils";
import type { Readable } from "node:stream";

const UPLOAD_BASE_DIR = path.join(__dirname, "..", "uploads");

const {
  TRANSFER: {
    CHUNKING: { CHUNK_RECEIVED, CHUNKS_MERGED, ALL_CHUNKS_RECEIVED },
  },
} = logs;

export const handleTransferChunkUpload = async ({
  accession,
  application,
  chunkIndex,
  totalChunks,
  receivedChecksum,
  chunkBuffer,
}: {
  accession: string;
  application: string;
  chunkIndex: number;
  totalChunks: number;
  receivedChecksum: string;
  chunkBuffer: Buffer;
}): Promise<Readable | null> => {
  if (
    Number.isNaN(chunkIndex) ||
    Number.isNaN(totalChunks) ||
    !receivedChecksum
  ) {
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Invalid chunk metadata."
    );
  }

  const transferDir = path.join(
    UPLOAD_BASE_DIR,
    `TR_${accession}_${application}`
  );
  await fs.promises.mkdir(transferDir, { recursive: true });

  const chunkPath = path.join(transferDir, `chunk_${chunkIndex}.bin`);
  await fs.promises.writeFile(chunkPath, chunkBuffer);

  console.log(CHUNK_RECEIVED(accession, application, chunkIndex, totalChunks));

  const receivedChunks = (await fs.promises.readdir(transferDir)).filter((f) =>
    f.startsWith("chunk_")
  ).length;

  if (receivedChunks < totalChunks) {
    return null; // Wait for remaining chunks
  }

  console.log(ALL_CHUNKS_RECEIVED(accession, application));

  const mergedPath = path.join(transferDir, "merged.zip");
  const mergedWriteStream = fs.createWriteStream(mergedPath);
  const hash = crypto.createHash("sha256");

  for (let i = 0; i < totalChunks; i++) {
    const chunkStream = fs.createReadStream(
      path.join(transferDir, `chunk_${i}.bin`)
    );
    // Pipe each chunk to both the hash and final merged stream
    await pipeline(
      chunkStream,
      async function* (source) {
        for await (const chunk of source) {
          hash.update(chunk);
          yield chunk;
        }
      },
      mergedWriteStream,
      { end: false }
    );
  }

  mergedWriteStream.end();
  await new Promise((res) => mergedWriteStream.on("finish", res));

  const computedChecksum = hash.digest("hex");
  if (computedChecksum !== receivedChecksum) {
    console.error("Checksum mismatch! File integrity compromised.");
    throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Checksum mismatch.");
  }

  // Cleanup chunk files
  const files = await fs.promises.readdir(transferDir);
  await Promise.all(
    files
      .filter((f) => f.startsWith("chunk_"))
      .map((f) => fs.promises.unlink(path.join(transferDir, f)))
  );

  console.log(CHUNKS_MERGED(accession, application));

  // Read the merged file back into memory as a buffer
  const mergedReadStream = fs.createReadStream(mergedPath);

  // Cleanup the temporary directory
  await fs.promises.rm(transferDir, { recursive: true, force: true });

  return mergedReadStream;
};
