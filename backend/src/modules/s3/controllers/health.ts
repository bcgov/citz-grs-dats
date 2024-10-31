import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { checkS3Connection } from "../utils";

export const health = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse } = req;

	const s3Connected = await checkS3Connection();

	const result = getStandardResponse({
		message: `S3 connection ${s3Connected ? "successful." : "failed. Ensure you are on the BC Gov network or VPN."}`,
		success: s3Connected,
	});

	res.status(s3Connected ? 200 : 500).json(result);
});
