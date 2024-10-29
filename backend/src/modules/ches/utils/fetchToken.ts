import { HttpError, safePromise } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "src/config";

const { CHES_CLIENT_ID, CHES_CLIENT_SECRET, CHES_TOKEN_ENDPOINT } = ENV;

export const fetchToken = async (): Promise<[Error, null] | [null, Response]> => {
	if (!CHES_CLIENT_ID || !CHES_CLIENT_SECRET || !CHES_TOKEN_ENDPOINT) {
		return [new HttpError(400, "Missing CHES configuration variables"), null];
	}

	const params = new URLSearchParams();
	params.append("grant_type", "client_credentials");
	params.append("client_id", CHES_CLIENT_ID);
	params.append("client_secret", CHES_CLIENT_SECRET);
	params.append("scope", "openid");

	const [err, response] = await safePromise(
		fetch(CHES_TOKEN_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params.toString(),
		}),
	);

	if (err) return [err, null];
	if (!response) return [new Error("fetchToken response returned null"), null];
	return [null, response];
};
