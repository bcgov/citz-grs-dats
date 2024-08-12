import * as crypto from "crypto";

function calculateHash(buffer, algorithm) {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash(algorithm);
      hash.update(buffer);
      const fileHash = hash.digest("hex");
      console.log(fileHash);
      resolve(fileHash);
    } catch (error) {
      reject(error);
    }
  });
}

export default calculateHash;
