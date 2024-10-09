// Check the API status periodically
export const checkApiStatus = async () => {
	try {
		const response = await fetch("http://localhost:3200/health");
		return response.ok;
	} catch (error) {
		console.error("Error checking API status:", error);
		return false;
	}
};
