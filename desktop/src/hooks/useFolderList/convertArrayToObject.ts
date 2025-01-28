import type { FolderRow } from "@renderer/components/file-list";

export const convertArrayToObject = (array: FolderRow[]) => {
  return array.reduce((acc, item) => {
    acc[item.folder] = item;
    return acc;
  }, {});
}
