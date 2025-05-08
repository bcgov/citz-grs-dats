import archiver from "archiver";
import unzipper from "unzipper";
import { PassThrough, type Readable } from "node:stream";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createWriteStream, promises as fsPromises } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";

type Props = {
  contentZipStream: Readable;
  documentation: Record<string, Buffer | Readable | null>;
  metadata: Record<string, Buffer | Readable | null>;
};

// Extract zip contents using unzipper and re-add to archive
const extractZipToArchive = async (
  zipStream: Readable,
  archive: archiver.Archiver
) => {
  const tempDir = await fsPromises.mkdtemp(join(tmpdir(), "zip-extract-"));
  const extractedFiles: string[] = [];

  try {
    const directory = zipStream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of directory) {
      if (entry.type === "File") {
        const tempFilePath = join(tempDir, entry.path);

        // Ensure the directory structure exists
        await fsPromises.mkdir(join(tempFilePath, ".."), { recursive: true });

        // Write the file to the temporary directory
        const writeStream = createWriteStream(tempFilePath);
        await pipeline(entry, writeStream);

        // Keep track of the extracted file
        extractedFiles.push(tempFilePath);

        // Append the file to the archive
        archive.file(tempFilePath, { name: `content/${entry.path}` });
      }
      entry.autodrain();
    }
  } catch (err) {
    console.error("Error during zip extraction:", err);
    throw err;
  } finally {
    // Delay cleanup until the archive is finalized
    archive.on("end", async () => {
      await fsPromises.rm(tempDir, { recursive: true, force: true });
    });
  }
};

// Create archive in-memory using chunked streaming
export const createStandardTransferZip = async ({
  contentZipStream,
  documentation,
  metadata,
}: Props): Promise<Buffer> => {
  console.log("Creating standard transfer zip...");
  const archive = archiver("zip", { zlib: { level: 9 } });
  const zipOutput = new PassThrough();
  archive.pipe(zipOutput);

  try {
    await extractZipToArchive(contentZipStream, archive);

    for (const [filename, file] of Object.entries(documentation)) {
      if (file) {
        archive.append(file, { name: `documentation/${filename}` });
      }
    }

    for (const [filename, file] of Object.entries(metadata)) {
      if (file) {
        archive.append(file, { name: `metadata/${filename}` });
      }
    }

    archive.finalize();

    const tempFilePath = path.join(os.tmpdir(), `temp-zip-${Date.now()}.zip`);
    const writeStream = fs.createWriteStream(tempFilePath);

    return new Promise((resolve, reject) => {
      zipOutput.on("data", (chunk) => {
        if (!writeStream.write(chunk)) {
          zipOutput.pause();
        }
      });

      writeStream.on("drain", () => {
        zipOutput.resume();
      });

      writeStream.on("finish", async () => {
        try {
          console.log("Zip file creation complete. Reading file...");
          const data = await fsPromises.readFile(tempFilePath);
          await fsPromises.unlink(tempFilePath); // Clean up temp file
          resolve(data);
        } catch (err) {
          reject(err);
        }
      });

      writeStream.on("error", async (err) => {
        try {
          await fsPromises.unlink(tempFilePath); // Clean up temp file on error
        } catch (cleanupErr) {
          // Handle cleanup error
          reject(cleanupErr);
        }
        reject(err);
      });

      zipOutput.on("error", async (err) => {
        try {
          await fsPromises.unlink(tempFilePath); // Clean up temp file on error
        } catch (cleanupErr) {
          // Handle cleanup error
          reject(cleanupErr);
        }
        reject(err);
      });

      zipOutput.on("end", () => {
        writeStream.end();
      });
    });
  } catch (err) {
    console.error("Error during zip creation:", err);
    throw err;
  }
};
