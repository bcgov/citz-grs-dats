import type { TransferZod } from "@/modules/transfer/entities";
import type { FileMetadataZodType } from "@/modules/filelist/schemas";

type Props = {
  files: TransferZod["metadata"]["files"];
  folders: string[]; // The folder names to include
};

export const createBagitFiles = ({
  files,
  folders,
}: Props): { bagit: Buffer; manifest: Buffer } => {
  // Create the content for bagit.txt
  const bagitContent =
    "BagIt-Version: 1.0\nTag-File-Character-Encoding: UTF-8\n";

  const relativeFolderPaths = folders.map((folder) => {
    const folderNameParts = folder.replaceAll("\\", "/").split("/");
    const folderName = folderNameParts[folderNameParts.length - 1];
    return { fullPath: folder.replaceAll("\\", "/"), folderName };
  });

  // Create the content for the manifest file
  let manifestContent = "";
  Object.entries(files).forEach(([folder, fileArray]) => {
    if (folders.includes(folder)) {
      fileArray.forEach((file: FileMetadataZodType) => {
        const relativeFolder = relativeFolderPaths.find(
          (entry) => entry.fullPath === folder.replaceAll("\\", "/")
        );
        let filePath = file.filepath.replaceAll("\\", "/");
        filePath = filePath.replace(
          relativeFolder?.fullPath!,
          relativeFolder?.folderName!
        );
        manifestContent += `${file.checksum} data/${filePath}\n`;
      });
    }
  });

  // Return both buffers
  return {
    bagit: Buffer.from(bagitContent, "utf-8"),
    manifest: Buffer.from(manifestContent, "utf-8"),
  };
};
