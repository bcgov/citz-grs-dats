import yauzl from "yauzl";
import yazl from "yazl";

// Define the Props type
type Props = {
  contentZipBuffer: Buffer;
  documentation: {
    fileList: {
      filename: string;
      buffer: Buffer;
    };
    transferForm: {
      filename: string;
      buffer: Buffer;
    };
    subAgreement: {
      filename: string;
      buffer: Buffer;
    };
  };
  metadata: {
    adminBuffer: Buffer;
    foldersBuffer: Buffer;
    filesBuffer: Buffer;
    notesBuffer?: Buffer | null;
  };
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
  zip.addBuffer(
    documentation.fileList.buffer,
    `documentation/${documentation.fileList.filename}`
  );
  zip.addBuffer(
    documentation.transferForm.buffer,
    `documentation/${documentation.transferForm.filename}`
  );
  zip.addBuffer(
    documentation.subAgreement.buffer,
    `documentation/${documentation.subAgreement.filename}`
  );

  // Add metadata files
  zip.addBuffer(metadata.adminBuffer, "metadata/admin.json");
  zip.addBuffer(metadata.foldersBuffer, "metadata/folders.json");
  zip.addBuffer(metadata.filesBuffer, "metadata/files.json");
  if (metadata.notesBuffer)
    zip.addBuffer(metadata.notesBuffer, "metadata/notes.txt");

  // Finalize zip and return buffer
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    zip.outputStream.on("data", (chunk) => buffers.push(chunk));
    zip.outputStream.on("end", () => resolve(Buffer.concat(buffers)));
    zip.outputStream.on("error", reject);
    zip.end();
  });
};
