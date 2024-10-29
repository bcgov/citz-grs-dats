export interface ExtendedResponse extends Response {
	result?: {
		json?: object;
		text?: string;
		formData?: FormData;
	};
}

export const safePromise = async (
	promise: Promise<Response>,
): Promise<[Error, null] | [null, ExtendedResponse]> => {
	try {
		const response: ExtendedResponse = await promise;
		response.result = {};

		// Check if there's a content-type header and if it's JSON
		const contentType = response.headers.get("content-type");

		// Parse JSON if the content type is 'application/json'
		if (contentType?.includes("application/json")) {
			const jsonData = await response.json();
			// Add the parsed JSON to the response as a new property
			response.result.json = jsonData;
		}

		// Parse text if the content type is 'text/'
		if (contentType?.includes("text/")) {
			const textData = await response.text();
			// Add the parsed text to the response as a new property
			response.result.text = textData;
		}

		// Parse formData if the content type is 'multipart/form-data'
		if (contentType?.includes("multipart/form-data")) {
			const formData = await response.formData();
			// Add the parsed formData to the response as a new property
			response.result.formData = formData;
		}

		return [null, response];
	} catch (error) {
		return [error as Error, null];
	}
};
