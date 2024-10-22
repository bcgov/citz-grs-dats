export const safePromise = async <T>(
	promise: Promise<Response>,
): Promise<[Error | null, T | null]> => {
	try {
		const response = await promise;

		// Check if there's a content-type header and if it's JSON
		const contentType = response.headers.get("content-type");

		// If the content type includes 'application/json', attempt to parse it as JSON
		if (contentType?.includes("application/json")) {
			const jsonData = (await response.json()) as T;
			return [null, jsonData];
		}

		// Otherwise, return null as the result if no JSON is present
		return [null, null];
	} catch (error) {
		return [error as Error, null];
	}
};
