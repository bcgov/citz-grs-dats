import { promises as fsPromises } from "node:fs";

export const doesDirectoryExist = async (dirPath: string): Promise<boolean> => {
  const { stat } = fsPromises;
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
