import { DATABASE_CONNECTION_SUCCESS, DATABASE_CONNECTION_ERROR } from "@/utils/logs";
import { ANSI_CODES } from "@bcgov/citz-imb-express-utilities";

describe("Database Connection Messages", () => {
	// Test case: should return the correct success message with ANSI codes
	it("should return the correct success message with ANSI codes", () => {
		const expectedSuccessMessage = `${ANSI_CODES.FOREGROUND.LIME}Database connection and initialization successful.${ANSI_CODES.FORMATTING.RESET}`;
		expect(DATABASE_CONNECTION_SUCCESS).toBe(expectedSuccessMessage);
	});

	// Test case: should return the correct error message with ANSI codes
	it("should return the correct error message with ANSI codes", () => {
		const expectedErrorMessage = `${ANSI_CODES.FOREGROUND.PINK}[ERROR] ${ANSI_CODES.FORMATTING.RESET}${ANSI_CODES.FOREGROUND.RED}Connecting to the database:${ANSI_CODES.FORMATTING.RESET}`;
		expect(DATABASE_CONNECTION_ERROR).toBe(expectedErrorMessage);
	});
});
