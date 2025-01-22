import yazl from "yazl";

type FileBufferObj = {
  filename: string;
  path: string;
  buffer: Buffer;
};

export const createZipBuffer = async (
  folders: Record<string, FileBufferObj[]>
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const zipfile = new yazl.ZipFile();
    const chunks: Buffer[] = [];

    // Iterate over folders (keys)
    Object.entries(folders).forEach(([folderName, files]) => {
      files.forEach(({ filename, path, buffer }) => {
        // Construct the full file path inside the zip
        const filePath = path
          ? `${folderName}/${path}/${filename}`
          : `${folderName}/${filename}`;
        zipfile.addBuffer(buffer, filePath);
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
