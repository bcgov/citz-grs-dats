import yazl from "yazl";
import crypto from "node:crypto";

export const createFinalTransfer = async (
  pspArray: { buffer: Buffer; schedule: string; classification: string }[]
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const zipFile = new yazl.ZipFile();
    const chunks: Buffer[] = [];
    const manifestLines: string[] = [];

    // Collect zip data into chunks
    zipFile.outputStream
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => resolve(Buffer.concat(chunks)))
      .on("error", (err) => reject(err));

    // Add PSP buffers to the archive
    for (const { buffer, schedule, classification } of pspArray) {
      const zipFileName = `PSP_${schedule}_${classification}.zip`;
      zipFile.addBuffer(buffer, zipFileName);

      // Generate SHA256 checksum
      const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
      manifestLines.push(`${checksum} ${zipFileName}`);
    }

    // Add manifest file to the archive
    const manifestContent = manifestLines.join("\n");
    zipFile.addBuffer(
      Buffer.from(manifestContent, "utf-8"),
      "manifest-sha256.txt"
    );

    // Finalize the archive
    zipFile.end();
  });
};
