import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { checkRabbitConnection } from "../utils";

export const health = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse } = req;

	const connected = checkRabbitConnection();

	const result = getStandardResponse({
		message: `Rabbit connection ${connected ? "successful." : "failed."}`,
		success: connected,
	});

	res.status(connected ? 200 : 503).json(result);
});
