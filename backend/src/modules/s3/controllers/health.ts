import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";

export const health = errorWrapper(async (req: Request, res: Response) => {
	res.status(200).json({ success: true });
});
