import { spawn } from 'node:child_process';

export const getExtendedMetadata = (filePath: string, extendedMetadataPowerShellScript: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const command = 'powershell.exe';
    const args = ['-ExecutionPolicy', 'Bypass', '-File', extendedMetadataPowerShellScript, '-FilePath', filePath];

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
      if (code === 0) {
        resolve(jsonData);
      } else {
        console.log(`[Extended Metadata] child process exited with code ${code}`);
        reject(code);
      }
    });

  });
};
