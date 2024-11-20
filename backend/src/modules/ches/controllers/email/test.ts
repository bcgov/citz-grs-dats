import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { sendEmail } from "../../utils";
import { EmailDataSchema } from "../../schemas";

export const emailTest = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse, getZodValidatedBody } = req;
	const body = getZodValidatedBody(EmailDataSchema);

	const { data, success } = await sendEmail(body);

	const result = getStandardResponse({
		data,
		message: `CHES email ${success ? "successful." : "failed."}`,
		success,
	});

	// Return email result
	return res.status(success ? 201 : 500).json(result);
});
