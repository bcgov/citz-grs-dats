import {
  runPowerShellBatch,
  type PowerShellBatchOptions,
} from "./runPowerShellBatch";

export const getExtendedMetadataBatch = (
  filePaths: string[],
  extendedMetadataPowerShellScript: string,
  options?: PowerShellBatchOptions
): Promise<Record<string, unknown>> => {
  const results: Record<string, unknown> = {};

  return runPowerShellBatch(
    extendedMetadataPowerShellScript,
    filePaths,
    (line) => {
      if (line.startsWith("OK|")) {
        const [, filepath, json] = line.split("|", 3);
        try {
          results[filepath] = JSON.parse(json);
        } catch {
          results[filepath] = { error: "Failed to parse JSON" };
        }
      } else if (line.startsWith("ERROR|")) {
        const [, filepath, message] = line.split("|", 3);
        results[filepath] = { error: message };
      }
    },
    {
      maxFilesPerChunk: 20,
      ...options,
    }
  ).then(() => results);
};
