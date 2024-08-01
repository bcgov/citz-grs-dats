import crypto from 'crypto';

function validateBufferChecksum(file, receivedChecksum: string, algorithm: string = 'sha1'): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            console.log('In validateFileChecksum');


            // Calculate the checksum of the uploaded file
            const hash = crypto.createHash(algorithm);
            hash.update(file.buffer);
            const calculatedChecksum = hash.digest('hex');

            console.log('In validateFileChecksum receivedChecksum: ' + receivedChecksum);
            console.log('In validateFileChecksum calculatedChecksum: ' + calculatedChecksum);

            // Compare checksums
            if (calculatedChecksum !== receivedChecksum) {
                console.log('Checksum mismatch');
                resolve(false);
            } else {
                resolve(true);
            }
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}

export default validateBufferChecksum;
