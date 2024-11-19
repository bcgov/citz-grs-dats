export const formatDate = (date?: string | null): string => {
	if (!date || date === "") return "";
	const parsedDate = new Date(date);
	if (Number.isNaN(parsedDate.getTime())) {
		return date; // Return the original value if it's not a valid date
	}
	const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
	const day = String(parsedDate.getUTCDate()).padStart(2, "0");
	const year = parsedDate.getUTCFullYear();
	return `${month}-${day}-${year}`;
};
