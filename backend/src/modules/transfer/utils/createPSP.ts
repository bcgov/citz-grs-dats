import archiver from "archiver";
import unzipper from "unzipper";
import { PassThrough } from "node:stream";
import { createBagitFiles } from "./createBagitFiles";
import type { TransferZod } from "../entities";

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB

type Props = {
  folderContent: string[];
  buffer: Buffer; // Standard transfer zip
  metadata: {
    admin: NonNullable<TransferZod["metadata"]>["admin"];
    folders: NonNullable<TransferZod["metadata"]>["folders"];
    files: NonNullable<TransferZod["metadata"]>["files"];
  };
};

export const createPSP = async ({
  folderContent,
  buffer,
  metadata,
}: Props): Promise<Buffer> => {
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

  const zip = archiver("zip", { zlib: { level: 9 } });
  const zipOutput = new PassThrough();
  zip.pipe(zipOutput);

  const directory = await unzipper.Open.buffer(buffer);

  for (const entry of directory.files) {
    const entryPath = entry.path;

    if (
      entryPath.startsWith("metadata/") ||
      entryPath.startsWith("documentation/")
    ) {
      zip.append(entry.stream(), { name: entryPath });
    } else if (entryPath.startsWith("content/")) {
      const folderMatch = Array.from(allowedFolders).some((folder) =>
        entryPath.startsWith(folder)
      );

      if (folderMatch && !entryPath.endsWith("/")) {
        const relativePath = entryPath.replace("content/", "data/");
        zip.append(entry.stream(), { name: relativePath });
      }
    }
  }

  zip.append(bagitFiles.bagit, { name: "bagit.txt" });
  zip.append(bagitFiles.manifest, { name: "manifest-sha256.txt" });
  zip.finalize();

  const bufferQueue: Buffer[] = [];
  let bufferedSize = 0;
  const chunkBuffers: Buffer[] = [];

  return new Promise((resolve, reject) => {
    zipOutput.on("data", (chunk: Buffer) => {
      bufferQueue.push(chunk);
      bufferedSize += chunk.length;

      while (bufferedSize >= CHUNK_SIZE) {
        let chunkSize = 0;
        const buffersToConcat: Buffer[] = [];

        while (bufferQueue.length && chunkSize < CHUNK_SIZE) {
          const next = bufferQueue[0];
          const remaining = CHUNK_SIZE - chunkSize;

          if (next.length <= remaining) {
            chunkSize += next.length;
            buffersToConcat.push(bufferQueue.shift()!);
          } else {
            buffersToConcat.push(next.slice(0, remaining));
            bufferQueue[0] = next.slice(remaining);
            chunkSize += remaining;
          }
        }

        chunkBuffers.push(Buffer.concat(buffersToConcat, chunkSize));
        bufferedSize -= chunkSize;
      }
    });

    zipOutput.on("end", () => {
      if (bufferQueue.length > 0) {
        chunkBuffers.push(Buffer.concat(bufferQueue, bufferedSize));
      }
      resolve(Buffer.concat(chunkBuffers));
    });

    zipOutput.on("error", (err) => reject(err));
  });
};
