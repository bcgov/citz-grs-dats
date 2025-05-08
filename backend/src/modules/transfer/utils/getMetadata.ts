import type { TransferZod } from "../entities";
import type { Readable } from "node:stream";
import unzipper from "unzipper";

export type Metadata = {
  admin: NonNullable<TransferZod["metadata"]>["admin"];
  folders: NonNullable<TransferZod["metadata"]>["folders"];
  files: NonNullable<TransferZod["metadata"]>["files"];
};

export const getMetadata = async (zipStream: Readable): Promise<Metadata> => {
  console.log("Extracting metadata from zip stream...");

  const extractedMetadata: Record<string, string> = {};

  try {
    const zipEntries = zipStream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of zipEntries) {
      if (
        entry.path.startsWith("metadata/") &&
        [
          "metadata/admin.json",
          "metadata/folders.json",
          "metadata/files.json",
        ].includes(entry.path)
      ) {
        const chunks: Buffer[] = [];
        entry.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });
        entry.on("end", () => {
          const fileContent = Buffer.concat(chunks).toString("utf-8");
          const json = JSON.parse(fileContent);
          if (entry.path === "metadata/admin.json") {
            extractedMetadata.admin = json;
          } else if (entry.path === "metadata/folders.json") {
            extractedMetadata.folders = json;
          } else if (entry.path === "metadata/files.json") {
            extractedMetadata.files = json;
          }
        });
      }

      entry.autodrain();
    }
  } catch (err) {
    console.error("Error during stream processing:", err);
    throw err;
  }

  return extractedMetadata as unknown as Metadata;
};
