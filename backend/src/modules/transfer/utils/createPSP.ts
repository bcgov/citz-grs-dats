import archiver from "archiver";
import unzipper from "unzipper";
import { PassThrough, type Readable } from "node:stream";
import { createBagitFiles } from "./createBagitFiles";
import type { TransferZod } from "../entities";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

type Props = {
  folderContent: string[];
  stream: Readable; // Standard transfer zip
  metadata: {
    admin: NonNullable<TransferZod["metadata"]>["admin"];
    folders: NonNullable<TransferZod["metadata"]>["folders"];
    files: NonNullable<TransferZod["metadata"]>["files"];
  };
};

export const createPSP = async ({
  folderContent,
  stream,
  metadata,
}: Props): Promise<Readable> => {
  console.log("Creating PSP zip file...");
  const zip = archiver("zip", { zlib: { level: 9 } });
  const zipOutput = new PassThrough();
  zip.pipe(zipOutput);

  try {
    const bagitFiles = createBagitFiles({
      files: metadata.files,
      folders: folderContent,
    });

    const allowedFolders = new Set(
      folderContent.map((folder) => {
        const folderNameParts = folder.replaceAll("\\", "/").split("/");
        const folderName = folderNameParts[folderNameParts.length - 1];
        return `content/${folderName}/`;
      })
    );

    const directory = stream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of directory) {
      if (entry.type === "File") {
        const entryPath = entry.path;

        if (
          entryPath.startsWith("metadata/") ||
          entryPath.startsWith("documentation/")
        ) {
          const tempFilePath = path.join(os.tmpdir(), path.basename(entryPath));
          const writeStream = fs.createWriteStream(tempFilePath);
          await new Promise((resolve, reject) => {
            entry.pipe(writeStream).on("finish", resolve).on("error", reject);
          });
          zip.file(tempFilePath, { name: entryPath });
        } else if (entryPath.startsWith("content/")) {
          const folderMatch = Array.from(allowedFolders).some((folder) =>
            entryPath.startsWith(folder)
          );

          if (folderMatch && !entryPath.endsWith("/")) {
            const relativePath = entryPath.replace("content/", "data/");
            const tempFilePath = path.join(
              os.tmpdir(),
              path.basename(entryPath)
            );
            const writeStream = fs.createWriteStream(tempFilePath);
            await new Promise((resolve, reject) => {
              entry.pipe(writeStream).on("finish", resolve).on("error", reject);
            });
            zip.file(tempFilePath, { name: relativePath });
          }
        }
      }
      entry.autodrain();
    }

    zip.append(bagitFiles.bagit, { name: "bagit.txt" });
    zip.append(bagitFiles.manifest, { name: "manifest-sha256.txt" });
    zip.finalize();

    return zipOutput;
  } catch (err) {
    console.error("Error during zip creation:", err);
    throw err;
  }
};
