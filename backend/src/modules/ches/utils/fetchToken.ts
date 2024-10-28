import { safePromise } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "src/config";

const { CHES_CLIENT_ID, CHES_CLIENT_SECRET, CHES_TOKEN_ENDPOINT } = ENV;

type TokenResponse = {
	access_token: string;
	expires_in: number;
	refresh_expires_in: number;
	token_type: string;
	"not-before-policy": number;
	scope: string;
};

export const fetchToken = async (): Promise<[Error | null, TokenResponse | null]> => {
	if (!CHES_CLIENT_ID || !CHES_CLIENT_SECRET || !CHES_TOKEN_ENDPOINT) {
		return [new Error("Missing CHES configuration variables"), null];
	}

	const params = new URLSearchParams();
	params.append("grant_type", "client_credentials");
	params.append("client_id", CHES_CLIENT_ID);
	params.append("client_secret", CHES_CLIENT_SECRET);

	// Use safePromise with fetch
	const [err, response] = await safePromise<TokenResponse>(
		fetch(CHES_TOKEN_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params.toString(),
		}),
	);

	if (err) return [err, null];

	// Check if the response contains an access token
	if (response?.access_token) return [null, response];
	return [new Error("Failed to retrieve CHES token"), null];
};
