import crypto from 'crypto';
import fs from 'fs';

async function validateFileChecksum(filePath: string, expectedChecksum: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha1');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => {
            hash.update(data);
        });

        stream.on('end', () => {
            const calculatedChecksum = hash.digest('hex');
            resolve(calculatedChecksum === expectedChecksum);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}
export default validateFileChecksum