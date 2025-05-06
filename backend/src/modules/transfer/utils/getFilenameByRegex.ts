import type { Readable } from "node:stream";
import unzipper from "unzipper";

type Props = {
  stream: Readable;
  directory: string;
  regex: RegExp;
};

export const getFilenameByRegex = async ({
  stream,
  directory,
  regex,
}: Props): Promise<string | null> => {
  let matchedFilename: string | null = null;

  try {
    const zipEntries = stream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of zipEntries) {
      if (entry.type === "File" && entry.path.startsWith(directory)) {
        const relativeFilename = entry.path.slice(directory.length);
        if (regex.test(relativeFilename)) {
          matchedFilename = relativeFilename;
          // Ensure we consume the rest of the stream to prevent hang
          entry.autodrain();
          break;
        }
      }
      // Always drain even if it's not a file or doesn't match
      entry.autodrain();
    }
  } catch (err) {
    console.error("Error during regex extraction:", err);
    throw err;
  }

  return matchedFilename;
};
