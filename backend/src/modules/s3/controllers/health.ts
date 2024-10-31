import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { checkS3Connection } from "../utils";

export const health = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse } = req;

	const connected = await checkS3Connection();

	const result = getStandardResponse({
		message: `S3 connection ${connected ? "successful." : "failed. Ensure you are on the BC Gov network or VPN."}`,
		success: connected,
	});

	res.status(connected ? 200 : 503).json(result);
});
