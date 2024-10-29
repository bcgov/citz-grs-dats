export const safePromise = async (
	promise: Promise<Response>,
): Promise<[Error, null] | [null, Response]> => {
	try {
		const response = await promise;

		return [null, response];
	} catch (error) {
		return [error as Error, null];
	}
};
