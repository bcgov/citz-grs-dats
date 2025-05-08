import type { FolderRow } from "@/renderer/types";

export const convertArrayToObject = (array: FolderRow[]) => {
  return array.reduce((acc, item) => {
    acc[item.folder] = item;
    return acc;
  }, {});
};
