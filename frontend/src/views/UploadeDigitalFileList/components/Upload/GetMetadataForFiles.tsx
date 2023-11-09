import CalculateChecksums from "./CalculateChecksums";

interface FileMetadata {
  name: string;
  size: number;
  type: string;
  path: string;
  owner: string;
  additionalData: string;
  checksum_SHA256: string;
  checksum_SHA1: string;
  checksum_SHA512: string;
  checksum_MD5: string;
}

const GetMetadataForFiles = async (files: File[]): Promise<FileMetadata[]> => {
  const metadataArray: FileMetadata[] = [];

  for (const file of files) {
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      checksum_SHA512: "",
      checksum_SHA1: "",
      checksum_SHA256: "",
      checksum_MD5: "",
      path: "",
      owner: "N/A",
      additionalData: "Your additional data here",
    };

    // Read the file content and create an ArrayBuffer from it
    const fileContent = await readAsArrayBuffer(file);

    const { md5, sha1, sha256, sha512 } = CalculateChecksums(fileContent);

    // Calculate the checksum
    metadata.checksum_MD5 = md5;
    metadata.checksum_SHA1 = sha1;
    metadata.checksum_SHA256 = sha256;
    metadata.checksum_SHA512 = sha512;

    metadataArray.push(metadata);
  }

  return metadataArray;
};

const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result instanceof ArrayBuffer) {
        resolve(result);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export { GetMetadataForFiles };
export type { FileMetadata };
