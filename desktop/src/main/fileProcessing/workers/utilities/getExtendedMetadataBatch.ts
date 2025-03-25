import { spawn } from "node:child_process";

export const getExtendedMetadataBatch = (
  filePaths: string[],
  extendedMetadataPowerShellScript: string
): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    const command = "powershell.exe";
    const args = [
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      extendedMetadataPowerShellScript,
      ...filePaths,
    ];

    const results: Record<string, unknown> = {};
    let stdoutBuffer = "";
    let stderrBuffer = "";

    const child = spawn(command, args);

    child.stdout.on("data", (data) => {
      stdoutBuffer += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderrBuffer += data.toString();
    });

    child.on("error", (err) => {
      console.error("Powershell error", err);
      reject(err);
    });

    child.on("close", (code) => {
      if (stderrBuffer) {
        return reject(new Error(stderrBuffer.trim()));
      }

      if (code !== 0) {
        console.log(`PowerShell exited with code ${code}`);
        return reject(new Error(`PowerShell exited with code ${code}`));
      }

      const lines = stdoutBuffer.split(/\r?\n/);
      for (const line of lines) {
        if (!line.trim()) continue;

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
      }

      resolve(results);
    });
  });
};
