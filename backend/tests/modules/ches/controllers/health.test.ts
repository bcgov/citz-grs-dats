import type { NextFunction, Request, Response } from "express";
import { health } from "@/modules/ches/controllers/health";
import { checkChesHealth } from "@/modules/ches/utils";
import type { StandardResponse, StandardResponseInput } from "@bcgov/citz-imb-express-utilities";

jest.mock("@/modules/ches/utils", () => ({
	checkChesHealth: jest.fn(),
}));

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");

	return {
		...originalModule,
		errorWrapper: (fn: unknown) => fn,
	};
});

// Test suite for health controller
describe("health controller", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		req = {
			getStandardResponse: <TData>(
				dataInput: StandardResponseInput<TData>,
			): StandardResponse<TData> => {
				const { success = true, data, message } = dataInput;

				return {
					success,
					data,
					message: message ?? "",
				} as StandardResponse<TData>;
			},
		};
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		res = {
			status: statusMock,
		} as Partial<Response>;
		next = jest.fn();

		jest.clearAllMocks(); // Clear previous mocks before each test
	});

	// Test case: Should return 200 when CHES connection is successful
	it("should return 200 if CHES connection is successful", async () => {
		(checkChesHealth as jest.Mock).mockResolvedValue({
			data: { success: true },
			success: true,
		});

		await health(req as Request, res as Response, next);

		expect(checkChesHealth).toHaveBeenCalled();
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			success: true,
			data: { success: true },
			message: "CHES connection successful.",
		});
	});

	// Test case: Should return 200 when CHES connection is unsuccessful
	it("should return 200 if CHES connection is unsuccessful", async () => {
		(checkChesHealth as jest.Mock).mockResolvedValue({
			data: { success: false },
			success: false,
		});

		await health(req as Request, res as Response, next);

		expect(checkChesHealth).toHaveBeenCalled();
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			data: { success: false },
			message: "CHES connection failed.",
		});
	});

	// Test case: Should throw an error if checkChesHealth fails
	it("should throw an error if checkChesHealth fails", async () => {
		const checkChesHealthError = new Error("CHES health check failed");
		(checkChesHealth as jest.Mock).mockRejectedValue(checkChesHealthError);

		await expect(health(req as Request, res as Response, next)).rejects.toThrow(
			"CHES health check failed",
		);
	});
});
