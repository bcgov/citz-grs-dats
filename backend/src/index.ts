import mongoose from "mongoose";
import app from "./express";
import { serverStartupLogs } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "./config";
import { handleTermination, logs } from "./utils";
import { TransferModel } from "./modules/transfer/entities";

const { PORT, MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE_NAME, MONGO_HOST } =
  ENV;
const {
  DATABASE: { CONNECTION_SUCCESS, CONNECTION_ERROR },
} = logs;

if (!(MONGO_HOST && MONGO_DATABASE_NAME && MONGO_USER && MONGO_PASSWORD))
  throw new Error(
    "One or more of [MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE_NAME, MONGO_HOST] env vars is undefined."
  );

// Create the MongoDB connection URI.
const mongoUri = `mongodb://${MONGO_USER}:${encodeURIComponent(
  MONGO_PASSWORD
)}@${MONGO_HOST}/${MONGO_DATABASE_NAME}?authSource=admin`;

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log(CONNECTION_SUCCESS);

    // Retrieve MongoDB Storage Stats
    try {
      const db = mongoose.connection.db;
      const stats = await db?.stats();

      // Ensure indexes are created
      await TransferModel.syncIndexes();

      console.log("MongoDB Storage Stats:");
      console.log(` - Data Size: ${stats?.dataSize} bytes`);
      console.log(` - Storage Size: ${stats?.storageSize} bytes`);
      console.log(` - Index Size: ${stats?.indexSize} bytes`);
      console.log(` - Collections: ${stats?.collections}`);
      console.log(` - Objects: ${stats?.objects}`);

      if (stats?.totalSize && stats?.storageSize) {
        const freeStorage = stats.totalSize - stats.storageSize;
        const freeStoragePercentage = (
          (freeStorage / stats.totalSize) *
          100
        ).toFixed(2);

        console.log(
          ` - Free Storage (Unused): ${freeStorage} bytes (${freeStoragePercentage}%)`
        );
      } else {
        console.log(" - Free Storage (Unused): Data unavailable");
      }
    } catch (error) {
      console.error("Failed to retrieve MongoDB stats:", error);
    }

    app.listen(PORT, () => {
      try {
        // Log server start information.
        serverStartupLogs(PORT);
      } catch (error) {
        // Log any error that occurs during the server start.
        console.error(error);
      }
    });
  })
  .catch((error) => {
    console.error(`${CONNECTION_ERROR}:`, error);
  });

// Set up process termination handlers
process.on("SIGINT", handleTermination);
process.on("SIGTERM", handleTermination);
