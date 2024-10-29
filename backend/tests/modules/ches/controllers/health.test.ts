import type { NextFunction, Request, Response } from "express";
import { health } from "@/modules/ches/controllers/health";
import { fetchToken } from "@/modules/ches/utils";
import { safePromise } from "@bcgov/citz-imb-express-utilities";
import type { StandardResponse, StandardResponseInput } from "@bcgov/citz-imb-express-utilities";

jest.mock("@/modules/ches/utils", () => ({
	fetchToken: jest.fn(),
}));

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");

	return {
		...originalModule,
		safePromise: jest.fn(),
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
		(fetchToken as jest.Mock).mockResolvedValue([
			null,
			{
				ok: true,
				json: () => {
					return { access_token: "token" };
				},
			},
		]);
		(safePromise as jest.Mock).mockResolvedValue([
			null,
			{
				ok: true,
				json: () => {
					return { success: true };
				},
			},
		]);

		await health(req as Request, res as Response, next);

		expect(fetchToken).toHaveBeenCalled();
		expect(statusMock).toHaveBeenCalledWith(200);
	});

	// Test case: Should throw an error if fetchToken fails
	it("should throw an error if fetchToken fails", async () => {
		const fetchTokenError = new Error("Fetch token failed");
		(fetchToken as jest.Mock).mockResolvedValue([fetchTokenError, null]);

		await expect(health(req as Request, res as Response, next)).rejects.toThrow(
			"Fetch token failed",
		);
	});

	// Test case: Should throw an error if access_token is missing
	it("should throw an error if access_token is missing", async () => {
		(fetchToken as jest.Mock).mockResolvedValue([
			null,
			{
				ok: true,
				json: () => {
					return {};
				},
			},
		]);

		await expect(health(req as Request, res as Response, next)).rejects.toThrow(
			"Missing access_token in CHES token endpoint response.",
		);
	});

	// Test case: Should throw an error if CHES health endpoint call fails
	it("should throw an error if CHES health endpoint call fails", async () => {
		(fetchToken as jest.Mock).mockResolvedValue([
			null,
			{
				ok: true,
				json: () => {
					return { access_token: "token" };
				},
			},
		]);
		(safePromise as jest.Mock).mockResolvedValue([new Error("CHES health endpoint error"), null]);

		await expect(health(req as Request, res as Response, next)).rejects.toThrow(
			"CHES health endpoint error",
		);
	});

	// Test case: Should throw an error if healthResponse is not ok
	it("should throw an error if healthResponse is not ok", async () => {
		(fetchToken as jest.Mock).mockResolvedValue([
			null,
			{
				ok: true,
				json: () => {
					return { access_token: "token" };
				},
			},
		]);
		(safePromise as jest.Mock).mockResolvedValue([
			null,
			{
				ok: false,
				statusText: "Service Unavailable",
			},
		]);

		await expect(health(req as Request, res as Response, next)).rejects.toThrow(
			"CHES health endpoint returned an error: Service Unavailable",
		);
	});
});
