import unzipper from "unzipper";
import type { Readable } from "node:stream";
import path from "node:path";
import fs from "node:fs";
import { tmpdir } from "node:os";

export const getBase64FromZipStream = async (
  zipStream: Readable,
  filePath: string
): Promise<string | undefined> => {
  const targetFileName = path.basename(filePath); // Extract only the file name

  try {
    const zipEntries = zipStream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of zipEntries) {
      if (
        entry.type === "File" &&
        path.basename(entry.path) === targetFileName
      ) {
        const tempPath = path.join(tmpdir(), targetFileName);
        const writeStream = fs.createWriteStream(tempPath);
        await entry.pipe(writeStream);
        await new Promise((resolve, reject) => {
          writeStream.on("finish", resolve);
          writeStream.on("error", (error) => {
            console.error("Error writing to temp file:", error);
            reject(error);
          });
        });
        const fileBuffer = fs.readFileSync(tempPath);
        const base64String = fileBuffer.toString("base64");
        fs.unlinkSync(tempPath); // Clean up the temp file
        entry.autodrain();
        return base64String;
      }
      entry.autodrain();
    }
  } catch (err) {
    console.error("Error during zip processing:", err);
    throw err;
  }

  throw new Error(`File ${filePath} not found in the zip.`);
};
