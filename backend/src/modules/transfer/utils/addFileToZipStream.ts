import { PassThrough, type Readable } from "node:stream";
import unzipper from "unzipper";
import archiver from "archiver";

type Props = {
  zipStream: Readable;
  fileStream: Readable;
  filePath: string;
};

export const addFileToZipStream = async ({
  zipStream,
  fileStream,
  filePath,
}: Props): Promise<Readable> => {
  console.log(`Adding file to zip stream: ${filePath}`);
  const tempFiles: { [key: string]: Buffer } = {};

  try {
    // Extract files from the existing zip stream, including subdirectories
    const directory = zipStream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of directory) {
      if (entry.type === "File") {
        const chunks: Buffer[] = [];
        for await (const chunk of entry) {
          chunks.push(chunk);
        }
        tempFiles[entry.path] = Buffer.concat(chunks);
      } else {
        entry.autodrain(); // Skip directories
      }
    }

    // Create a new zip file with the existing and new files
    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = new PassThrough();
    archive.pipe(output);

    Object.entries(tempFiles).forEach(([fileName, buffer]) => {
      archive.append(buffer, { name: fileName });
    });

    // Add the new file to the zip
    archive.append(fileStream, { name: filePath });

    archive.finalize();

    return output;
  } catch (err) {
    console.error("Error while adding file to zip stream:", err);
    throw err;
  }
};
