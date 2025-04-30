import archiver from "archiver";
import unzipper from "unzipper";
import { PassThrough } from "node:stream";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promises as fsPromises } from "node:fs";

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
  console.log("Starting createStandardTransferZip...");
  const archive = archiver("zip", { zlib: { level: 9 } });
  const zipOutput = new PassThrough();
  archive.pipe(zipOutput);

  console.log("Extracting content zip entries...");
  await extractZipToArchive(contentZipBuffer, archive);

  console.log("Adding documentation files...");
  for (const [filename, buffer] of Object.entries(documentation)) {
    if (buffer) archive.append(buffer, { name: `documentation/${filename}` });
  }

  console.log("Adding metadata files...");
  for (const [filename, buffer] of Object.entries(metadata)) {
    if (buffer) archive.append(buffer, { name: `metadata/${filename}` });
  }

  console.log("Finalizing archive...");
  archive.finalize();

  const tempFilePath = path.join(os.tmpdir(), `temp-zip-${Date.now()}.zip`);
  console.log(`Temporary file path: ${tempFilePath}`);
  const writeStream = fs.createWriteStream(tempFilePath);

  return new Promise((resolve, reject) => {
    console.log("Piping zip output to write stream...");
    zipOutput.pipe(writeStream);

    writeStream.on("finish", async () => {
      console.log("Write stream finished. Reading temp file...");
      try {
        const data = await fsPromises.readFile(tempFilePath);
        console.log("Temp file read successfully. Cleaning up temp file...");
        await fsPromises.unlink(tempFilePath); // Clean up temp file
        console.log("Temp file deleted. Resolving promise...");
        resolve(data);
      } catch (err) {
        console.error("Error during write stream finish handling:", err);
        reject(err);
      }
    });

    writeStream.on("error", async (err) => {
      console.error("Error in write stream:", err);
      try {
        await fsPromises.unlink(tempFilePath); // Clean up temp file on error
        console.log("Temp file deleted after write stream error.");
      } catch (cleanupErr) {
        console.error(
          "Error during temp file cleanup after write stream error:",
          cleanupErr
        );
      }
      reject(err);
    });

    zipOutput.on("error", async (err) => {
      console.error("Error in zip output:", err);
      try {
        await fsPromises.unlink(tempFilePath); // Clean up temp file on error
        console.log("Temp file deleted after zip output error.");
      } catch (cleanupErr) {
        console.error(
          "Error during temp file cleanup after zip output error:",
          cleanupErr
        );
      }
      reject(err);
    });
  });
};
