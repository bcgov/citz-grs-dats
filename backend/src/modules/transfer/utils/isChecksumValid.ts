import crypto from "node:crypto";
import {
  HttpError,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";
import type { Readable } from "node:stream";
import unzipper from "unzipper";

type Props = {
  stream: Readable;
  checksum: string;
  filePath?: string;
};

/**
 * Validates a buffer and checksum. If a filePath is provided, validates the checksum
 * against the file within the buffer if it's a valid zip archive.
 */
export const isChecksumValid = async ({
  stream,
  checksum,
  filePath,
}: Props): Promise<boolean> => {
  const calculateChecksum = (data: Buffer): string => {
    const hash = crypto.createHash("sha256");
    hash.update(data);
    return hash.digest("hex");
  };

  if (filePath) {
    // Create a promise to validate the zip
    return new Promise<boolean>((resolve, reject) => {
      const foundFile = false;

      stream
        .pipe(unzipper.Parse())
        .on("entry", (entry) => {
          if (entry.path === filePath) {
            const chunks: Buffer[] = [];
            entry
              .on("data", (chunk: Buffer) => chunks.push(chunk))
              .on("end", () => {
                const fileBuffer: Buffer = Buffer.concat(chunks);
                const fileChecksum: string = calculateChecksum(fileBuffer);

                if (fileChecksum === checksum) {
                  resolve(true);
                } else {
                  reject(false);
                }
              })
              .on("error", (err: Error) => reject(err));
          } else {
            entry.autodrain();
          }
        })
        .on("close", () => {
          if (!foundFile) {
            reject(
              new HttpError(
                HTTP_STATUS_CODES.NOT_FOUND,
                `File at path "${filePath}" not found in the zip stream.`
              )
            );
          }
        })
        .on("error", (err) => reject(err));
    });
  }

  // If no filePath is provided, validate the checksum of the entire stream
  return new Promise<boolean>((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    stream
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => {
        const streamChecksum = hash.digest("hex");
        if (streamChecksum === checksum) resolve(true);
        else resolve(false);
      })
      .on("error", (err) => reject(err));
  });
};
