import { promises as fsPromises } from "node:fs";

// Creates directory if doesnt exist
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fsPromises.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
  }
};
