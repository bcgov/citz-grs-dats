export const formatDate = (date?: string | null): string => {
	if (!date || date === "") return "";

	// Check if the string is in ISO format
	const isISO = date.includes("T");
	if (!isISO) {
		// Handle non-ISO date string in the format YYYY/MM/DD
		const parts = date.split("/");
		if (parts.length !== 3) {
			return ""; // Return an empty string if the format is unexpected
		}

		const [year, month, day] = parts;
		if (!year || !month || !day) {
			return ""; // Return an empty string if any part is missing
		}

		const parsedYear = year.trim();
		const parsedMonth = month.trim().padStart(2, "0");
		const parsedDay = day.trim().padStart(2, "0");
		return `${parsedYear}-${parsedMonth}-${parsedDay}`;
	}

	// Handle ISO date strings (UTC timezone)
	const parsedDate = new Date(date);
	if (Number.isNaN(parsedDate.getTime())) {
		return date; // Return the original value if it's not a valid date
	}

	const year = parsedDate.getUTCFullYear();
	const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
	const day = String(parsedDate.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};
