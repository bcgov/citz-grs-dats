import yauzl from "yauzl";
import type { TransferZod } from "../entities";
import {
  HttpError,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";

export type Metadata = {
  admin: TransferZod["metadata"]["admin"];
  folders: TransferZod["metadata"]["folders"];
  files: TransferZod["metadata"]["files"];
};

export const getMetadata = (zipBuffer: Buffer): Promise<Metadata> => {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipFile) => {
      if (err) return reject(err);

      if (!zipFile) {
        return reject(
          new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Invalid zip file.")
        );
      }

      const metadata: Partial<Metadata> = {};

      zipFile.readEntry();

      zipFile.on("entry", (entry) => {
        if (
          entry.fileName.startsWith("metadata/") &&
          [
            "metadata/admin.json",
            "metadata/folders.json",
            "metadata/files.json",
          ].includes(entry.fileName)
        ) {
          zipFile.openReadStream(entry, (streamErr, readStream) => {
            if (streamErr) {
              zipFile.close();
              return reject(streamErr);
            }

            const chunks: Buffer[] = [];
            readStream?.on("data", (chunk) => {
              chunks.push(chunk);
            });

            readStream?.on("end", () => {
              try {
                const content = JSON.parse(
                  Buffer.concat(chunks).toString("utf-8")
                );
                if (entry.fileName === "metadata/admin.json") {
                  metadata.admin = content;
                } else if (entry.fileName === "metadata/folders.json") {
                  metadata.folders = content;
                } else if (entry.fileName === "metadata/files.json") {
                  metadata.files = content;
                }

                if (metadata.admin && metadata.folders && metadata.files) {
                  zipFile.close();
                  return resolve(metadata as Metadata);
                }
              } catch (parseErr) {
                zipFile.close();
                return reject(parseErr);
              } finally {
                zipFile.readEntry(); // Ensure we continue processing the next entry
              }
            });

            readStream?.on("error", (streamErr) => {
              zipFile.close();
              reject(streamErr);
            });
          });
        } else {
          zipFile.readEntry(); // Continue to the next entry if not a metadata file
        }
      });

      zipFile.on("end", () => {
        if (!metadata.admin || !metadata.folders || !metadata.files) {
          zipFile.close();
          reject(
            new HttpError(
              HTTP_STATUS_CODES.NOT_FOUND,
              "One or more metadata files are missing."
            )
          );
        }
      });

      zipFile.on("error", (zipErr) => {
        reject(zipErr);
      });
    });
  });
};
