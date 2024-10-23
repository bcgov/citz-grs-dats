// Check the API status periodically
export const checkApiStatus = async (url: string) => {
	try {
		const response = await fetch(`${url}/health`);
		return response.ok;
	} catch (error) {
		console.error("Error checking API status:", error);
		return false;
	}
};
