import Client from "ssh2-sftp-client";

export const sftp = new Client();

export const config = {
  host: process.env.LAN_FTP_SERVER_HOST || "CUMULUS.IDIR.BCGOV",
  port: process.env.LAN_FTP_SERVER_PORT || "22",
  username: "IDIR\GRSDATS" || "",
  password: process.env.LAN_FTP_SERVER_PASSWORD || "",
};

const remotePath = process.env.LAN_FTP_SERVER_REMOTE_PATH || "/dev";

export const sftpHealthCheck = async (): Promise<void> => {
  try {
    console.log('Why is it broken?: ', config);
    await sftp.connect(config);

    // Perform a basic operation to verify the connection (list files in a directory)
    const fileList = await sftp.list(remotePath);
    console.log("SFTP health check successful. Files in directory:", fileList);
  } catch (error) {
    if (error instanceof Error) {
      console.error("SFTP health check failed:", error.message);
    } else {
      console.error("SFTP health check failed with an unknown error");
    }
    throw error;
  } finally {
    await sftp.end();
  }
};
