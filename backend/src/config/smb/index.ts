import SambaClient from "samba-client";

const smbClient = new SambaClient({
  address:
    process.env.SMB_ARCHIVE_LAND_DRIVE ||
    "\\\\cumulus.idir.bcgov\\Digital-Archives",
  username: process.env.SMB_ARCHIVE_LAND_USER || "",
  password: process.env.SMB_ARCHIVE_LAND_PASSWORD || "",
  domain: process.env.SMB_ARCHIVE_LAND_DOMAIN || "IDIR",
});

// Path to check on the shared drive
const directoryPath = "dev";

export const healthCheck = async () => {
  console.log(
    "SMB health check using user: ",
    process.env.SMB_ARCHIVE_LAND_USER
  );
  console.log("Testing connection to: ", process.env.SMB_ARCHIVE_LAND_DRIVE);
  try {
    const files = await smbClient.dir(directoryPath);
    console.log("Health check successful. Files in directory:", files);
  } catch (err) {
    console.error("Health check failed:", err);
    throw new Error("SMB1 connection is unhealthy");
  }
};
