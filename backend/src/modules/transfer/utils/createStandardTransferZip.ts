import yauzl from "yauzl";
import yazl from "yazl";

// Define the Props type
type Props = {
  contentZipBuffer: Buffer;
  documentation: Record<string, Buffer | null>;
  metadata: Record<string, Buffer | null>;
};

// Utility function to extract content from a zip buffer and add it to another zip
const extractZip = async (zipBuffer: Buffer, zip: yazl.ZipFile) => {
  return new Promise<void>((resolve, reject) => {
    yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipFile) => {
      if (err) return reject(err);
      zipFile.readEntry();

      zipFile.on("entry", (entry) => {
        if (entry.fileName.endsWith("/")) {
          zipFile.readEntry();
        } else {
          zipFile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);
            const chunks: Buffer[] = [];
            readStream?.on("data", (chunk) => chunks.push(chunk));
            readStream?.on("end", () => {
              zip.addBuffer(Buffer.concat(chunks), `content/${entry.fileName}`);
              zipFile.readEntry();
            });
          });
        }
      });

      zipFile.on("end", resolve);
      zipFile.on("error", reject);
    });
  });
};

// Function to create the standard transfer zip
export const createStandardTransferZip = async ({
  contentZipBuffer,
  documentation,
  metadata,
}: Props): Promise<Buffer> => {
  const zip = new yazl.ZipFile();

  // Extract content zip into 'content' directory
  await extractZip(contentZipBuffer, zip);

  // Add documentation files
  Object.entries(documentation).forEach(([filename, buffer]) => {
    if (!buffer) return;
    zip.addBuffer(buffer, `documentation/${filename}`);
  });

  // Add metadata files
  Object.entries(metadata).forEach(([filename, buffer]) => {
    if (!buffer) return;
    zip.addBuffer(buffer, `metadata/${filename}`);
  });

  // Finalize zip and return buffer
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    zip.outputStream.on("data", (chunk) => buffers.push(chunk));
    zip.outputStream.on("end", () => resolve(Buffer.concat(buffers)));
    zip.outputStream.on("error", reject);
    zip.end();
  });
};
