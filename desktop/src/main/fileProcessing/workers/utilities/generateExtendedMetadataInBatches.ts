import { exec } from 'node:child_process';
import path from 'node:path';

const getFolderMetadata = (folderPath: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    //TODO: confirm that this path will work in the final build
    const scriptPath = path.join('out', 'es-workers', 'scripts', 'getExtendedMetadata.ps1');
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -FolderPath "${folderPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      try {
        const metadata = JSON.parse(stdout);
        resolve(metadata);
      } catch (parseError) {
        reject(`Parse Error: ${(parseError as Error).message}`);
      }
    });
  });
};

export const generateExtendedMetadataInBatches = async (source: string) => {
  console.log("[worker] Generating extended metadata for:", source);

  try {
    const metadata = await getFolderMetadata(source);
    const extendedMetadata: Record<string, unknown[]> = { [source]: [metadata] };
    console.log("====[worker] Extended metadata:", extendedMetadata);
    return { extendedMetadata };
  } catch (error) {
    console.error("Error generating extended metadata:", error);
    throw error;
  }
};
