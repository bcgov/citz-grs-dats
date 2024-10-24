import { safePromise } from "../utils/safePromise";

export const fetchProtectedRoute = async (
	url: string,
	accessToken: string | undefined,
	options: RequestInit = {},
): Promise<[Error | null, Response | null]> => {
	if (!accessToken) return [new Error("Access token is missing or undefined."), null];

	const authHeaderValue = `Bearer ${accessToken}`;
	options.headers = { ...options.headers, authorization: authHeaderValue };

	return safePromise(fetch(url, options));
};
