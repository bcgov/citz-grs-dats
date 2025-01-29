import { promises as fsPromises, type Stats } from "node:fs";
import path from "node:path";

export const countFiles = async (dir: string): Promise<number> => {
  const { stat, readdir } = fsPromises;
  let count = 0;
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat: Stats = await stat(filePath);

    if (fileStat.isDirectory()) {
      count += await countFiles(filePath);
    } else {
      count += 1;
    }
  }

  return count;
};
