import SMB2 from 'smb2';

const smb2Client = new SMB2({
    share: process.env.SMB_ARCHIVE_LAND_DRIVE || '\\\\Cumulus\\Digital-Archives',
    domain: process.env.SMB_ARCHIVE_LAND_DRIVE || "",
    username: process.env.SMB_ARCHIVE_LAND_DRIVE || "",
    password: process.env.SMB_ARCHIVE_LAND_DRIVE || "",
});

// Path to check on the shared drive
const directoryPath = '\\dev\\';

export const healthCheck = async () => {
    return new Promise<void>((resolve, reject) => {
        smb2Client.readdir(directoryPath, (err, files) => {
            if (err) {
                console.error('Health check failed:', err);
                reject(new Error('SMB2 connection is unhealthy'));
            } else {
                console.log('Health check successful. Files in directory:', files);
                resolve();
            }
        });
    });
};

// Function to close the SMB2 connection
export const closeConnection = () => {
    smb2Client.close();
};

