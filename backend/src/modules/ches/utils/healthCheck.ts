import { HttpError, safePromise } from "@bcgov/citz-imb-express-utilities";
import { fetchToken } from "./fetchToken";
import { ENV } from "src/config";

const { CHES_URL } = ENV;

export const checkChesHealth = async (): Promise<{ data: unknown; success: boolean }> => {
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

	return { data, success: true };
};
