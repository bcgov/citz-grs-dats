import { z } from "zod";
import {
  fileMetadataZodSchema,
  folderMetadataZodSchema,
} from "src/modules/filelist/schemas";
import {
  HttpError,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";
import { Buffer } from "node:buffer";
import yauzl from "yauzl";
import { adminMetadataZodSchema } from "../entities";

const foldersSchema = z.record(folderMetadataZodSchema);
const filesSchema = z.record(z.array(fileMetadataZodSchema));
const adminSchema = adminMetadataZodSchema;

type Data = {
  buffer: Buffer; // Zip of standard transfer
  accession: string;
  application: string;
};

const extractFileFromZip = (
  zipBuffer: Buffer,
  filePath: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipFile) => {
      if (err) return reject(err);
      if (!zipFile)
        return reject(
          new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Invalid zip file.")
        );

      let fileFound = false;

      zipFile.on("entry", (entry) => {
        if (entry.fileName === filePath) {
          fileFound = true;
          zipFile.openReadStream(entry, (err, readStream) => {
            if (err) {
              zipFile.close();
              return reject(err);
            }
            const chunks: Buffer[] = [];
            readStream.on("data", (chunk) => chunks.push(chunk));
            readStream.on("end", () => {
              zipFile.close();
              resolve(Buffer.concat(chunks).toString("utf-8"));
            });
          });
        } else {
          zipFile.readEntry();
        }
      });

      zipFile.on("end", () => {
        if (!fileFound) {
          zipFile.close();
          reject(
            new HttpError(
              HTTP_STATUS_CODES.BAD_REQUEST,
              `File ${filePath} not found in the zip.`
            )
          );
        }
      });

      zipFile.readEntry();
    });
  });
};

export const validateMetadataFiles = async ({
  buffer,
  accession,
  application,
}: Data): Promise<void> => {
  // Check for "metadata/" folder indirectly by looking for its required files
  const requiredFiles = [
    "metadata/admin.json",
    "metadata/files.json",
    "metadata/folders.json",
  ];
  const extractedFiles: Record<string, string> = {};

  for (const file of requiredFiles) {
    try {
      extractedFiles[file] = await extractFileFromZip(buffer, file);
    } catch (err) {
      if (
        err instanceof HttpError &&
        err.statusCode === HTTP_STATUS_CODES.BAD_REQUEST
      ) {
        throw new HttpError(
          HTTP_STATUS_CODES.BAD_REQUEST,
          `The zip file is missing required file: ${file}`
        );
      }
      throw err;
    }
  }

  // Parse and validate each file
  try {
    adminSchema.parse(JSON.parse(extractedFiles["metadata/admin.json"]));
  } catch (err) {
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      `Validation failed for admin.json: ${
        err instanceof Error ? err.message : ""
      }`
    );
  }

  try {
    filesSchema.parse(JSON.parse(extractedFiles["metadata/files.json"]));
  } catch (err) {
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      `Validation failed for files.json: ${
        err instanceof Error ? err.message : ""
      }`
    );
  }

  try {
    foldersSchema.parse(JSON.parse(extractedFiles["metadata/folders.json"]));
  } catch (err) {
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      `Validation failed for folders.json: ${
        err instanceof Error ? err.message : ""
      }`
    );
  }

  // Validate accession and application values in admin.json
  const adminFile = JSON.parse(extractedFiles["metadata/admin.json"]);
  const { accession: adminAccession, application: adminApplication } =
    adminFile;

  if (!adminAccession || !adminApplication) {
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      'The admin.json file is missing "accession" or "application" values.'
    );
  }

  if (adminAccession !== accession || adminApplication !== application) {
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "The accession or application values in admin.json are incorrect."
    );
  }
};
