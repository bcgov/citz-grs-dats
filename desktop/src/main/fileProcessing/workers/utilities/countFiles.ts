import { promises as fsPromises } from "node:fs";
import path from "node:path";

const { readdir } = fsPromises;

export const countFiles = async (dir: string): Promise<number> => {
  const entries = await readdir(dir, { withFileTypes: true });

  const counts = await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return countFiles(filePath); // Recursively count files in subdirectory
      }
      return 1; // Count file
    })
  );

  return counts.reduce((acc, count) => acc + count, 0);
};
