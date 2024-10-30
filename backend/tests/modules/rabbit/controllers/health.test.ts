import type { Request, Response } from "express";
import { health } from "@/modules/rabbit/controllers";
import { checkRabbitConnection } from "@/modules/rabbit/utils";
import type { StandardResponse, StandardResponseInput } from "@bcgov/citz-imb-express-utilities";

// Mock the utils
jest.mock("@/modules/rabbit/utils", () => ({
	checkRabbitConnection: jest.fn(),
}));

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");

	return {
		...originalModule,
		safePromise: jest.fn(),
		errorWrapper: (fn: unknown) => fn,
	};
});

describe("Test suite for health endpoint", () => {
	const mockRequest = (override?: Partial<Request>): Request =>
		({
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
			...override,
		}) as Request;

	const mockResponse = (): Response => {
		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		return res as unknown as Response;
	};

	// Test case: Rabbit connection is successful
	it("Test case: Rabbit connection successful", async () => {
		const req = mockRequest();
		const res = mockResponse();
		const next = jest.fn();
		const message = "Rabbit connection successful.";

		(checkRabbitConnection as jest.Mock).mockReturnValue(true); // Mock successful connection

		await health(req, res, next);

		expect(checkRabbitConnection).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			message,
			success: true,
		});
	});

	// Test case: Rabbit connection failed
	it("Test case: Rabbit connection failed", async () => {
		const req = mockRequest();
		const res = mockResponse();
		const next = jest.fn();
		const message = "Rabbit connection failed.";

		(checkRabbitConnection as jest.Mock).mockReturnValue(false); // Mock failed connection

		await health(req, res, next);

		expect(checkRabbitConnection).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			message,
			success: false,
		});
	});
});
