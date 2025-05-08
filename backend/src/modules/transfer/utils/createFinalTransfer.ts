import archiver from "archiver";
import { PassThrough, type Readable } from "node:stream";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const createFinalTransfer = async (
  pspArray: { stream: Readable; schedule: string; classification: string }[]
): Promise<Readable> => {
  console.log("Creating final transfer zip file...");
  const archive = archiver("zip", { zlib: { level: 9 } });
  const zipOutput = new PassThrough();
  archive.pipe(zipOutput);

  const manifestLines: string[] = [];

  // Append each PSP zip and add checksum
  for (const { stream, schedule, classification } of pspArray) {
    const zipFileName = `PSP_${schedule}_${classification}.zip`;
    const tempFilePath = path.join(os.tmpdir(), zipFileName);
    const tempFileStream = fs.createWriteStream(tempFilePath);

    const hash = crypto.createHash("sha256");
    stream.on("data", (chunk) => {
      hash.update(chunk);
      tempFileStream.write(chunk);
    });

    await new Promise<void>((resolve, reject) => {
      stream.on("end", () => {
        tempFileStream.end(() => {
          const checksum = hash.digest("hex");
          manifestLines.push(`${checksum} ${zipFileName}`);
          resolve();
        });
      });
      stream.on("error", (err) => reject(err));
      tempFileStream.on("error", (err) => reject(err));
    });

    archive.file(tempFilePath, { name: zipFileName });
  }

  // Add the manifest file
  archive.append(manifestLines.join("\n"), { name: "manifest-sha256.txt" });
  archive.finalize();

  return zipOutput;
};
