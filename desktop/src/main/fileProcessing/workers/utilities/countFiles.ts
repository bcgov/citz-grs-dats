import { promises as fsPromises, type Stats } from "node:fs";
import path from "node:path";
import { parentPort } from "node:worker_threads";

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

  if (count === 0) {
    // Folder is empty
    parentPort?.postMessage({
      type: "emptyFolder",
      path: dir,
    });
  }

  return count;
};
