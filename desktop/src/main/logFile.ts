import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

const LOG_RETENTION_MS = 24 * 60 * 60 * 1000;

let logFilePath = "";

const getTimestamp = (): string => new Date().toISOString();

const writeLog = (level: string, args: unknown[]) => {
  const message = args
    .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
    .join(" ");
  const line = `${getTimestamp()} [${level}] ${message}\n`;

  try {
    fs.appendFileSync(logFilePath, line, "utf-8");
  } catch {
    // Silently ignore write failures
  }
};

const pruneOldEntries = () => {
  try {
    const data = fs.readFileSync(logFilePath, "utf-8");
    const cutoff = Date.now() - LOG_RETENTION_MS;
    const pruned = data
      .split("\n")
      .filter((line) => {
        if (!line.trim()) return false;
        const ts = line.substring(0, 24); // ISO timestamp is 24 chars
        const parsed = new Date(ts).getTime();
        return !Number.isNaN(parsed) && parsed > cutoff;
      })
      .join("\n");
    fs.writeFileSync(logFilePath, pruned, "utf-8");
  } catch {
    // File may not exist yet
  }
};

export const initLogFile = () => {
  const logDir = path.join(app.getPath("userData"), "dats-logs");
  fs.mkdirSync(logDir, { recursive: true });
  logFilePath = path.join(logDir, "app.log");

  pruneOldEntries();

  const origLog = console.log.bind(console);
  const origError = console.error.bind(console);
  const origWarn = console.warn.bind(console);
  const origInfo = console.info.bind(console);

  console.log = (...args: unknown[]) => {
    origLog(...args);
    writeLog("LOG", args);
  };
  console.error = (...args: unknown[]) => {
    origError(...args);
    writeLog("ERROR", args);
  };
  console.warn = (...args: unknown[]) => {
    origWarn(...args);
    writeLog("WARN", args);
  };
  console.info = (...args: unknown[]) => {
    origInfo(...args);
    writeLog("INFO", args);
  };

  console.log(`[LogFile] Logging to ${logFilePath}`);
};

export const getLogFilePath = (): string => logFilePath;

export const writeWorkerLog = (level: string, message: string) => {
  writeLog(`WORKER [${level}]`, [message]);
};
