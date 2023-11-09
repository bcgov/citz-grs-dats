import CryptoJS from "crypto-js"; // Import CryptoJS

const CalculateChecksums = (fileContent: ArrayBuffer) => {
  // Convert the ArrayBuffer to an array of numbers
  const dataView = new DataView(fileContent);
  const dataArray: number[] = [];
  for (let i = 0; i < dataView.byteLength; i++) {
    dataArray.push(dataView.getUint8(i));
  }
  const wordArray = CryptoJS.lib.WordArray.create(dataArray);
  // Calculate all four checksums
  const md5Checksum = CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex);
  const sha1Checksum = CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex);
  const sha256Checksum = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
  const sha512Checksum = CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex);

  // Calculate the SHA-256 checksum
  return {
    md5: md5Checksum,
    sha1: sha1Checksum,
    sha256: sha256Checksum,
    sha512: sha512Checksum,
  };
};

export default CalculateChecksums;
