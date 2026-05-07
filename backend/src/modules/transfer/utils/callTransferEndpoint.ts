import { ENV } from "@/config";
import {
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { createHash } from "node:crypto";
import { createReadStream, promises as fsPromises } from "node:fs";

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB

const { INTERNAL_BACKEND_URL } = ENV;

type Props = {
  token: string | undefined;
  tempFilePath: string;
  accession: string;
  application: string;
};

const hashFile = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });

const readChunk = (filePath: string, start: number, end: number): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    // createReadStream end is inclusive, so subtract 1
    const stream = createReadStream(filePath, { start, end: end - 1 });
    stream.on("data", (chunk) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });

export const callTransferEndpoint = async ({
  token,
  tempFilePath,
  accession,
  application,
}: Props) => {
  const endpoint = `${INTERNAL_BACKEND_URL}/transfer`;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const { size: totalBytes } = await fsPromises.stat(tempFilePath);
  const contentChecksum = await hashFile(tempFilePath);
  const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);

  try {
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, totalBytes);
      const chunk = await readChunk(tempFilePath, start, end);

      const formData = new FormData();
      formData.append("file", new Blob([new Uint8Array(chunk)]), "file.bin");
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("contentChecksum", contentChecksum);
      formData.append("accession", accession);
      formData.append("application", application);

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response) {
        throw new HttpError(
          HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred."
        );
      }

      const jsonResponse = await response.json();
      const { success, message, data } = jsonResponse;

      if (!success) {
        throw new HttpError(
          HTTP_STATUS_CODES.BAD_REQUEST,
          message || "Transfer failed."
        );
      }

      // Only return response after the final chunk is processed
      if (chunkIndex === totalChunks - 1) {
        return { success, message, data };
      }
    }
  } finally {
    // Clean up temp file regardless of success or failure
    await fsPromises.unlink(tempFilePath).catch(() => {});
  }

  return {
    success: true,
    message: "All chunks uploaded successfully.",
    data: null,
  };
};
