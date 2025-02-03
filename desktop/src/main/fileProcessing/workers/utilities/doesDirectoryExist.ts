import { promises as fsPromises } from "node:fs";

const { stat } = fsPromises;

export const doesDirectoryExist = async (dirPath: string): Promise<boolean> => {
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // Directory does not exist
      return false;
    }
    throw error; // Re-throw other errors
  }
};
