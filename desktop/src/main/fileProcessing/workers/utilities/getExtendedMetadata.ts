import { spawn } from 'node:child_process';
import path from 'node:path';

export const getExtendedMetadata = (filePath: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    //TODO: confirm that this path will work in the final build
    const scriptPath = path.join('out', 'es-workers', 'scripts', 'getExtendedMetadata.ps1');
    const command = 'powershell.exe';
    const args = ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-FilePath', filePath];

    const extendedMetadataSpawnProcess = spawn(command, args);
    const jsonData = {};

    extendedMetadataSpawnProcess.on('error', (err) => {
      reject(err);
    });

    extendedMetadataSpawnProcess.stdout.on('data', (data) => {
      const parsedData = data.toString().split(' = ');
      jsonData[parsedData[0]] = parsedData[1];
    });

    extendedMetadataSpawnProcess.stderr.on('data', (data) => {
      reject(data);
    });

    extendedMetadataSpawnProcess.on('close', (code) => {
      console.log(`[Extended Metadata] child process exited with code ${code}`);
      if (code === 0) {
        resolve(jsonData);
      } else {
        reject(code);
      }
    });

  });
};
