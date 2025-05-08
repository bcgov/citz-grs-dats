import unzipper from "unzipper";
import {
  HttpError,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";
import type { Metadata } from "./getMetadata";
import type { Readable } from "node:stream";
import { PassThrough } from "node:stream";

type Props = {
  stream: Readable;
  metadata: Metadata;
};

export const validateContentMatchesMetadata = async ({
  stream,
  metadata,
}: Props): Promise<void> => {
  console.log("Validating content matches metadata...");

  const foundContentEntries = new Set<string>();
  const folderPaths = Object.keys(metadata.folders); // Get all folder paths from the metadata
  const folderNames = folderPaths.map((folderPath) => {
    const folderParts = folderPath.replaceAll("\\", "/").split("/");
    return `content/${folderParts[folderParts.length - 1]}/`; // Get the folder name from the path
  });

  try {
    const zipEntries = stream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of zipEntries) {
      const parts = entry.path.split("/");
      const parentDirectory = parts[0];

      // Check if this entry is in the 'content' directory and matches any folder from metadata
      if (
        parentDirectory === "content" &&
        folderNames.some((folder) => entry.path.startsWith(folder))
      ) {
        const folderMatch = folderNames.find((folder) =>
          entry.path.startsWith(folder)
        );
        if (folderMatch) foundContentEntries.add(folderMatch);
      }

      entry.autodrain();
    }
  } catch (err) {
    console.error("Error during stream processing:", err);
    throw err;
  }

  // Validate folders in the metadata exist in the zip file's content directory
  const missingFolders = folderNames.filter((folderName) => {
    const foundFolders = Array.from(foundContentEntries);
    return !foundFolders.includes(folderName);
  });

  if (missingFolders.length > 0)
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      `The zip file is missing required folders: ${missingFolders.join(", ")}.`
    );
};
