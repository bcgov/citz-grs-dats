import mongoose from "mongoose";
import app from "./express";
import { serverStartupLogs } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "./config";
import { handleTermination, logs } from "./utils";

const { PORT, MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE_NAME, MONGO_HOST } = ENV;
const { DATABASE_CONNECTION_SUCCESS, DATABASE_CONNECTION_ERROR } = logs;

if (!(MONGO_HOST && MONGO_DATABASE_NAME && MONGO_USER && MONGO_PASSWORD))
	throw new Error(
		"One or more of [MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE_NAME, MONGO_HOST] env vars is undefined.",
	);

// Create the MongoDB connection URI
const mongoUri = `mongodb://${MONGO_USER}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_HOST}/${MONGO_DATABASE_NAME}?authSource=admin`;

mongoose
	.connect(mongoUri)
	.then(() => {
		console.log(DATABASE_CONNECTION_SUCCESS);
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
		console.error(`${DATABASE_CONNECTION_ERROR}:`, error);
	});

// Set up process termination handlers
process.on("SIGINT", handleTermination);
process.on("SIGTERM", handleTermination);
