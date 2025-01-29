import { promises as fsPromises } from "node:fs";

export const writeOrAppendMetadata = async (
  metadataFilePath: string,
  newMetadata: Record<string, unknown>
): Promise<void> => {
  const { writeFile } = fsPromises;
  let finalMetadata: Record<string, unknown>;

  try {
    const existingMetadataRaw = await fsPromises.readFile(
      metadataFilePath,
      "utf8"
    );
    const existingMetadata = JSON.parse(existingMetadataRaw) as Record<
      string,
      unknown
    >;

    finalMetadata = { ...existingMetadata, ...newMetadata };
  } catch {
    finalMetadata = newMetadata;
  }

  await writeFile(metadataFilePath, JSON.stringify(finalMetadata, null, 2));
};
