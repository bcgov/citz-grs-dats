import archiver from "archiver";
import unzipper from "unzipper";
import { PassThrough } from "node:stream";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Define the Props type
type Props = {
  contentZipBuffer: Buffer;
  documentation: Record<string, Buffer | null>;
  metadata: Record<string, Buffer | null>;
};

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
  console.log("Creating standard transfer zip...");
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

  const tempFilePath = path.join(os.tmpdir(), `temp-zip-${Date.now()}.zip`);
  const writeStream = fs.createWriteStream(tempFilePath);

  return new Promise((resolve, reject) => {
    zipOutput.pipe(writeStream);

    writeStream.on("finish", () => {
      fs.readFile(tempFilePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          fs.unlink(tempFilePath, () => {}); // Clean up temp file
          resolve(data);
        }
      });
    });

    writeStream.on("error", (err) => {
      fs.unlink(tempFilePath, () => {}); // Clean up temp file on error
      reject(err);
    });

    zipOutput.on("error", (err) => {
      fs.unlink(tempFilePath, () => {}); // Clean up temp file on error
      reject(err);
    });
  });
};
