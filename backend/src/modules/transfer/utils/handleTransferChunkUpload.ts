import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { logs } from "@/utils";

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
}): Promise<Buffer | null> => {
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

  // Define upload directory
  const transferDir = path.join(
    UPLOAD_BASE_DIR,
    `TR_${accession}_${application}`
  );
  if (!fs.existsSync(transferDir)) {
    fs.mkdirSync(transferDir, { recursive: true });
  }

  // Save chunk
  const chunkPath = path.join(transferDir, `chunk_${chunkIndex}.bin`);
  fs.writeFileSync(chunkPath, chunkBuffer);
  console.log(CHUNK_RECEIVED(accession, application, chunkIndex, totalChunks));

  // Check if all chunks have been received
  const receivedChunks = fs
    .readdirSync(transferDir)
    .filter((file) => file.startsWith("chunk_")).length;

  if (receivedChunks < totalChunks) {
    return null; // Not all chunks received yet
  }

  console.log(ALL_CHUNKS_RECEIVED(accession, application));

  // Reassemble chunks
  const zipBufferArray = [];
  for (let i = 0; i < totalChunks; i++) {
    const chunkData = fs.readFileSync(path.join(transferDir, `chunk_${i}.bin`));
    zipBufferArray.push(chunkData);
  }

  const contentZipBuffer = Buffer.concat(zipBufferArray);

  // Compute SHA-256 checksum
  const hash = crypto.createHash("sha256");
  hash.update(contentZipBuffer);
  const computedChecksum = hash.digest("hex");

  if (computedChecksum !== receivedChecksum) {
    console.error("Checksum mismatch! File integrity compromised.");
    throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Checksum mismatch.");
  }

  // Cleanup chunk files
  fs.readdirSync(transferDir).forEach((file) => {
    if (file.startsWith("chunk_")) {
      fs.unlinkSync(path.join(transferDir, file));
    }
  });

  console.log(CHUNKS_MERGED(accession, application));
  return contentZipBuffer;
};
