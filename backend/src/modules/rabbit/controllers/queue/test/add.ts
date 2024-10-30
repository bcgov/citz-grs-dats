import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { addToTestQueue } from "src/modules/rabbit/utils";

// Adds to test queue which processes one request per 10 seconds.
export const add = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse } = req;

	const jobID = `job-${Date.now()}`;

	// Add the job ID to the RabbitMQ queue
	await addToTestQueue(jobID);

	const result = getStandardResponse({
		data: { jobID },
		message: "Queue will process a job every 10 seconds.",
		success: true,
	});

	// Respond with job ID
	res.status(200).json(result);
});
