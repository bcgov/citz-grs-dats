import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { checkS3Connection } from "../utils";

export const health = errorWrapper(async (req: Request, res: Response) => {
	const s3Connected = await checkS3Connection();

	if (s3Connected)
		return res.status(200).json({ success: true, message: "S3 connection successful" });
	res.status(500).json({ success: false, message: "S3 connection failed" });
});
