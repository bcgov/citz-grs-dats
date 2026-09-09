import {
  runPowerShellBatch,
  type PowerShellBatchOptions,
} from "./runPowerShellBatch";

export const getOwnerBatch = (
  filePaths: string[],
  ownerPowerShellScript: string,
  options?: PowerShellBatchOptions
): Promise<Map<string, string>> => {
  const results = new Map<string, string>();

  return runPowerShellBatch(
    ownerPowerShellScript,
    filePaths,
    (line) => {
      if (line.startsWith("OK|")) {
        const [, filepath, owner] = line.split("|", 3);
        results.set(filepath, owner ?? "Not Available");
      } else if (line.startsWith("ERROR|")) {
        const [, filepath] = line.split("|", 3);
        results.set(filepath, "Not Available");
      }
    },
    {
      maxFilesPerChunk: 100,
      ...options,
    }
  ).then(() => results);
};
