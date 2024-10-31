import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { checkChesHealth } from "../utils";

export const health = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse } = req;

	const { data, success } = await checkChesHealth();

	const result = getStandardResponse({
		data,
		message: `CHES connection ${success ? "successful." : "failed."}`,
		success,
	});

	// Return health check result
	return res.status(success ? 200 : 503).json(result);
});
