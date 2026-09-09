import { parentPort } from "node:worker_threads";

const startTime = Date.now();

const getElapsedTime = (): string => {
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

const formatArg = (a: unknown): string => {
  if (a instanceof Error) {
    return `${a.name}: ${a.message}${a.stack ? `\n${a.stack}` : ""}`;
  }
  if (typeof a === "object" && a !== null) {
    return JSON.stringify(a, null, 2);
  }
  return String(a);
};

const sendLog = (level: string, args: unknown[]) => {
  const message = args.map(formatArg).join(" ");
  const timestamped = `[${getElapsedTime()}] [${level}] ${message}`;
  parentPort?.postMessage({ type: "log", level, message: timestamped });
};

console.log = (...args: unknown[]) => sendLog("LOG", args);
console.error = (...args: unknown[]) => sendLog("ERROR", args);
console.warn = (...args: unknown[]) => sendLog("WARN", args);
console.info = (...args: unknown[]) => sendLog("INFO", args);
