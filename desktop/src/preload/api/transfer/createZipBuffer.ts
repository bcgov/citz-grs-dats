import yazl from "yazl";
import path from "node:path";
import { Buffer } from "node:buffer";

type FileBufferObj = {
  filename: string;
  path: string; // Already includes the folder and filename
  buffer: Buffer;
};

export const createZipBuffer = async (
  folders: Record<string, FileBufferObj[]>
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const zipfile = new yazl.ZipFile();
    const chunks: Buffer[] = [];

    // Iterate over folders
    Object.entries(folders).forEach(([folder, bufferObjs]) => {
      bufferObjs.forEach(({ path: filePath, buffer }) => {
        zipfile.addBuffer(
          Buffer.from(buffer),
          `${folder}${path.posix.normalize(filePath)}`
        );
      });
    });

    zipfile.end();

    // Collect the zip data as a Buffer
    zipfile.outputStream.on("data", (chunk) => chunks.push(chunk));
    zipfile.outputStream.on("end", () =>
      resolve(Buffer.concat(chunks as unknown as Uint8Array[]))
    );
    zipfile.outputStream.on("error", (err) => reject(err));
  });
};
