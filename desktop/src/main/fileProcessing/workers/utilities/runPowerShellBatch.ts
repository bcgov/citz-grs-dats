import { spawn } from "node:child_process";

const DEFAULT_MAX_FILES_PER_CHUNK = 100;
const DEFAULT_RETRIES = 2;
const MAX_COMMAND_LINE_CHARS = 15_000;
const RETRY_BACKOFF_MS = 1_000;

const chunkFilePaths = (
  filePaths: string[],
  maxFilesPerChunk: number
): string[][] => {
  const chunks: string[][] = [];
  let current: string[] = [];
  let charCount = 0;

  for (const filePath of filePaths) {
    if (
      current.length > 0 &&
      (current.length >= maxFilesPerChunk ||
        charCount + filePath.length + 1 > MAX_COMMAND_LINE_CHARS)
    ) {
      chunks.push(current);
      current = [];
      charCount = 0;
    }
    current.push(filePath);
    charCount += filePath.length + 1;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
};

const runPowerShell = (
  script: string,
  args: string[]
): Promise<{ stdout: string }> => {
  return new Promise((resolve, reject) => {
    const command = "powershell.exe";
    const child = spawn(command, [
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      script,
      ...args,
    ]);

    let stdoutBuffer = "";
    let stderrBuffer = "";

    child.stdout.on("data", (data) => {
      stdoutBuffer += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderrBuffer += data.toString();
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(stderrBuffer.trim() || `PowerShell exited with code ${code}`)
        );
        return;
      }
      resolve({ stdout: stdoutBuffer });
    });
  });
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type PowerShellBatchOptions = {
  retries?: number;
  maxFilesPerChunk?: number;
};

export const runPowerShellBatch = async (
  script: string,
  filePaths: string[],
  parseLine: (line: string) => void,
  options: PowerShellBatchOptions = {}
): Promise<void> => {
  const retries = options.retries ?? DEFAULT_RETRIES;
  const maxFilesPerChunk =
    options.maxFilesPerChunk ?? DEFAULT_MAX_FILES_PER_CHUNK;

  for (const chunk of chunkFilePaths(filePaths, maxFilesPerChunk)) {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { stdout } = await runPowerShell(script, chunk);
        for (const line of stdout.split(/\r?\n/)) {
          if (!line.trim()) continue;
          parseLine(line);
        }
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
        console.warn(
          `[PowerShellBatch] Chunk of ${chunk.length} file(s) failed on attempt ${attempt + 1} of ${retries + 1}:`,
          error
        );
        if (attempt < retries) await sleep(RETRY_BACKOFF_MS * (attempt + 1));
      }
    }
    if (lastError !== undefined) throw lastError;
  }
};
