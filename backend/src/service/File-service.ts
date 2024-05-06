
import fs from "fs";
import mimeTypes from "mime-types";
const path = require('path');
import calculateHash from "../utils/calculateHash";

function getContentType(filePath: string): any | false {
    const fileExtension = filePath.split('.').pop(); // Get file extension
    if (fileExtension) {
        const mimeType = mimeTypes.lookup(filePath); // Get MIME type based on file path
        if (mimeType) {
            const applicationType = mimeTypes.contentType(mimeType); // Get application type based on MIME type
            if (applicationType) {
                return { mimeType, applicationType };
            }
        }
    }
    return false;
}

export default class FileService {

    static async getMetadatas(filePath) {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(filePath)) {
                // Get the file stats
                fs.stat(filePath, async (err, stats) => {
                    if (err) {
                        // Reject the promise with an error
                        reject(err);
                    } else {
                        const { mimeType, applicationType } = getContentType(filePath)
                        //const applicationType = mime.getExtension(mimeType);
                        const sha256HashPromise = await calculateHash(filePath, 'sha256');
                        console.log(sha256HashPromise);

                        // Resolve the promise with the file metadata
                        resolve({
                            sha256: sha256HashPromise,
                            name: filePath,
                            size: stats.size,
                            mode: stats.mode,
                            atime: stats.atime,
                            mtime: stats.mtime,
                            ctime: stats.ctime,
                            birthtime: stats.birthtime,
                            mimeType,
                            applicationType,
                        });
                    }
                });
            } else {
                // Reject the promise with a not found error
                reject(new Error("File not found"));
            }
        });
    }


    static async getFilesinFolder(directoryPath) {
        fs.readdir(directoryPath, (err, items) => {
            if (err) {
                console.error('Error reading directory: jl', err);
                return;
            }

            // Use async forEach to filter and log only files
            items.forEach((item) => {
                const itemPath = path.join(directoryPath, item);
                fs.stat(itemPath, (statErr, stats) => {
                    if (statErr) {
                        console.error(`Error reading ${item}:`, statErr);
                        return;
                    }

                    if (stats.isFile()) {
                        console.log('File:', item);
                    }
                });
            });
        });

    }

}