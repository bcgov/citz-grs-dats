import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { addToQueue } from "../queue";

// Adds to test queue which processes one request per 10 seconds.
export const addToTestQueue = errorWrapper(async (req: Request, res: Response) => {
	const jobID = `job-${Date.now()}`;

	// Add the job ID to the RabbitMQ queue
	await addToQueue(jobID);

	// Respond with job ID
	res
		.status(200)
		.json({ success: true, message: "Queue will process a job every 10 seconds.", jobID });
});
