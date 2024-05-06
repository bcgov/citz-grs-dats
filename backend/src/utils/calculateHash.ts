import * as fs from "fs";
import * as crypto from "crypto";

function calculateHash(filePath, algorithm) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);

    const stream = fs.createReadStream(filePath);
    stream.on("data", (data) => {
      hash.update(data);
    });

    stream.on("end", () => {
      const fileHash = hash.digest("hex");
      console.log(fileHash);
      resolve(fileHash);
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
}

export default calculateHash;
