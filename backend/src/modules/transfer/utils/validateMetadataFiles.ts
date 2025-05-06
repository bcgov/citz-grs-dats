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
import unzipper from "unzipper";
import { adminMetadataZodSchema } from "../entities";
import type { Readable } from "node:stream";
import { writeStreamToTempFile } from "@/utils";
import fs from "node:fs";

const foldersSchema = z.record(folderMetadataZodSchema);
const filesSchema = z.record(z.array(fileMetadataZodSchema));
const adminSchema = adminMetadataZodSchema;

type Data = {
  stream: Readable; // Zip of standard transfer
  accession: string;
  application: string;
};

const extractFileFromZip = async (
  zipStream: Readable,
  filePath: string
): Promise<string> => {
  try {
    const zipEntries = zipStream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of zipEntries) {
      if (entry.path === filePath) {
        // Return file content as a string
        const chunks: Buffer[] = [];
        entry.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });
        return new Promise((resolve, reject) => {
          entry.on("end", () => {
            const fileContent = Buffer.concat(chunks).toString("utf-8");
            resolve(fileContent);
          });
          entry.on("error", (err: Error) => {
            reject(err);
          });
        });
      }

      entry.autodrain();
    }
  } catch (err) {
    console.error("Error during zip processing:", err);
    throw err;
  }

  // If the file is not found, throw an error
  throw new Error(`File "${filePath}" not found in the zip archive.`);
};

export const validateMetadataFiles = async ({
  stream,
  accession,
  application,
}: Data): Promise<void> => {
  console.log("Validating metadata files...");

  const tempStreamPath = await writeStreamToTempFile(stream);

  // Clone the content zip stream for validation
  const stream1 = fs.createReadStream(tempStreamPath);
  const stream2 = fs.createReadStream(tempStreamPath);
  const stream3 = fs.createReadStream(tempStreamPath);

  const extractedFiles: Record<string, string> = {};

  extractedFiles["metadata/admin.json"] = await extractFileFromZip(
    stream1,
    "metadata/admin.json"
  );
  extractedFiles["metadata/files.json"] = await extractFileFromZip(
    stream2,
    "metadata/files.json"
  );
  extractedFiles["metadata/folders.json"] = await extractFileFromZip(
    stream3,
    "metadata/folders.json"
  );

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
