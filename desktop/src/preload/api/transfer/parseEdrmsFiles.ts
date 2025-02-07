import { promises as fs } from "node:fs";
import * as path from "node:path";

type EdrmsFiles = {
  dataport?: File;
  fileList?: File;
  transferForm?: File;
};

export const parseEdrmsFiles = async (
  folderPath: string
): Promise<EdrmsFiles> => {
  const result: EdrmsFiles = {};
  try {
    const files = await fs.readdir(folderPath);

    for (const fileName of files) {
      const filePath = path.join(folderPath, fileName);
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) continue;

      if (
        /^(DataPort|Data Port|Digital Archives export).*\.txt$/i.test(fileName)
      ) {
        result.dataport = new File([await fs.readFile(filePath)], fileName);
      } else if (/^File List.*\.pdf$/i.test(fileName)) {
        result.fileList = new File([await fs.readFile(filePath)], fileName);
      } else if (/^(Transfer_Form|617).*\.pdf$/i.test(fileName)) {
        result.transferForm = new File([await fs.readFile(filePath)], fileName);
      }
    }

    return result;
  } catch (error) {
    console.error("Error parsing EDRMS files:", error);
    return result;
  }
};
