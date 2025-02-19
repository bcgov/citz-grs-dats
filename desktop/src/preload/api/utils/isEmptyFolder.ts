import { statSync, readdirSync } from "node:fs";

/**
 * Checks if the given path is an empty folder.
 * @param filePath - The path to check.
 * @returns True if the path is a non-empty folder, false otherwise.
 */
export const isEmptyFolder = (filePath: string): boolean => {
  try {
    const stats = statSync(filePath);
    return !(stats.isDirectory() && readdirSync(filePath).length > 0);
  } catch {
    return true; // Handles cases where the path does not exist or is inaccessible
  }
};
