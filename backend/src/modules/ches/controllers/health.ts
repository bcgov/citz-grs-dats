import type { Request, Response } from "express";
import { errorWrapper, HttpError, safePromise } from "@bcgov/citz-imb-express-utilities";
import { fetchToken } from "../utils";
import { ENV } from "src/config";

const { CHES_URL } = ENV;

export const health = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse } = req;

	// Fetch token for CHES auth.
	const [fetchTokenError, tokenResponse] = await fetchToken();
	if (fetchTokenError) throw fetchTokenError;

	const { access_token } = await tokenResponse.json();

	// Get access token.
	if (!access_token)
		throw new HttpError(404, "Missing access_token in CHES token endpoint response.");

	// Call CHES /health endpoint using safePromise
	const [healthError, healthResponse] = await safePromise(
		fetch(`${CHES_URL}/health`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		}),
	);
	if (healthError) throw healthError;

	// Check if the response is OK
	if (!healthResponse?.ok) {
		const errorMessage = `CHES health endpoint returned an error: ${healthResponse?.statusText}`;
		throw new HttpError(400, errorMessage);
	}

	const data = await healthResponse.json();

	const result = getStandardResponse({
		data,
		message: "CHES connection successful",
		success: true,
	});

	// Return health check result
	return res.status(200).json(result);
});
