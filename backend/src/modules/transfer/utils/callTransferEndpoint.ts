import { ENV } from "@/config";
import {
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB

const { INTERNAL_BACKEND_URL } = ENV;

type Props = {
  token: string | undefined;
  standardTransferZipBuffer: Buffer;
  accession: string;
  application: string;
};

export const callTransferEndpoint = async ({
  token,
  standardTransferZipBuffer,
  accession,
  application,
}: Props) => {
  const endpoint = `${INTERNAL_BACKEND_URL}/transfer`;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new Uint8Array(standardTransferZipBuffer.buffer)
  );
  const contentChecksum = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const totalChunks = Math.ceil(
    standardTransferZipBuffer.byteLength / CHUNK_SIZE
  );

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(
      start + CHUNK_SIZE,
      standardTransferZipBuffer.byteLength
    );
    const chunk = standardTransferZipBuffer.slice(start, end);

    const formData = new FormData();
    formData.append("file", new Blob([chunk]), "file.bin");
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

  return {
    success: true,
    message: "All chunks uploaded successfully.",
    data: null,
  };
};
