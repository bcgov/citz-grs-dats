import unzipper from "unzipper";
import type { Readable } from "node:stream";
import path from "node:path";

export const getFileFromZipStream = async (
  zipStream: Readable,
  filePath: string
): Promise<Readable | undefined> => {
  const targetFileName = path.basename(filePath); // Extract only the file name
  let fileFound = false;

  try {
    const zipEntries = zipStream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of zipEntries) {
      if (path.basename(entry.path) === targetFileName) {
        fileFound = true;
        return entry; // Return the readable stream for the matched file
      }

      entry.autodrain();
    }
  } catch (err) {
    console.error("Error during zip processing:", err);
    throw err;
  }

  if (!fileFound) {
    throw new Error(`File ${filePath} not found in the zip.`);
  }
};
