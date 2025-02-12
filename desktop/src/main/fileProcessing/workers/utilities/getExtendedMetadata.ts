import { exec } from 'node:child_process';
import path from 'node:path';

export const getExtendedMetadata = (filePath: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    //TODO: confirm that this path will work in the final build
    const scriptPath = path.join('out', 'es-workers', 'scripts', 'getExtendedMetadata.ps1');
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -FilePath "${filePath}"`;

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
