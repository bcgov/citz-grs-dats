import { type ExtendedResponse, safePromise } from "../utils/safePromise";

export const fetchProtectedRoute = async (
	url: string,
	accessToken: string | undefined,
	options: RequestInit = {},
): Promise<[Error, null] | [null, ExtendedResponse]> => {
	if (!accessToken) return [new Error("Access token is missing or undefined."), null];

	const authHeaderValue = `Bearer ${accessToken}`;
	options.headers = { ...options.headers, authorization: authHeaderValue };

	const response = await safePromise(fetch(url, options));
	return response;
};
