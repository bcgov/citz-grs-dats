import type { Request, Response } from "express";
import { services } from "@/modules/health/controllers";
import { checkS3Connection } from "@/modules/s3/utils";
import { checkRabbitConnection } from "@/modules/rabbit/utils";
import { checkChesHealth } from "@/modules/ches/utils";
import type { StandardResponse, StandardResponseInput } from "@bcgov/citz-imb-express-utilities";

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");

	return {
		...originalModule,
		safePromise: jest.fn(),
		errorWrapper: (fn: unknown) => fn,
	};
});

// Mock the utility functions
jest.mock("@/modules/s3/utils", () => ({
	checkS3Connection: jest.fn(),
}));

jest.mock("@/modules/rabbit/utils", () => ({
	checkRabbitConnection: jest.fn(),
}));

jest.mock("@/modules/ches/utils", () => ({
	checkChesHealth: jest.fn(),
}));

describe("Test suite for health services endpoint", () => {
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

	// Test case: All services are healthy
	it("Test case: All services are healthy", async () => {
		const req = mockRequest();
		const res = mockResponse();
		const next = jest.fn();
		const message = "All services are healthy.";

		(checkS3Connection as jest.Mock).mockResolvedValue(true); // Mock S3 connection as healthy
		(checkRabbitConnection as jest.Mock).mockReturnValue(true); // Mock Rabbit connection as healthy
		(checkChesHealth as jest.Mock).mockResolvedValue({ success: true }); // Mock CHES health as healthy

		await services(req, res, next);

		expect(checkS3Connection).toHaveBeenCalled();
		expect(checkRabbitConnection).toHaveBeenCalled();
		expect(checkChesHealth).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			data: {
				s3: true,
				rabbit: true,
				ches: true,
			},
			message,
			success: true,
		});
	});

	// Test case: S3 service is unhealthy
	it("Test case: S3 service is unhealthy", async () => {
		const req = mockRequest();
		const res = mockResponse();
		const next = jest.fn();
		const message = "One or more services are unhealthy.";

		(checkS3Connection as jest.Mock).mockResolvedValue(false); // Mock S3 connection as unhealthy
		(checkRabbitConnection as jest.Mock).mockReturnValue(true); // Mock Rabbit connection as healthy
		(checkChesHealth as jest.Mock).mockResolvedValue({ success: true }); // Mock CHES health as healthy

		await services(req, res, next);

		expect(checkS3Connection).toHaveBeenCalled();
		expect(checkRabbitConnection).toHaveBeenCalled();
		expect(checkChesHealth).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(503);
		expect(res.json).toHaveBeenCalledWith({
			data: {
				s3: false,
				rabbit: true,
				ches: true,
			},
			message,
			success: false,
		});
	});

	// Test case: Rabbit service is unhealthy
	it("Test case: Rabbit service is unhealthy", async () => {
		const req = mockRequest();
		const res = mockResponse();
		const next = jest.fn();
		const message = "One or more services are unhealthy.";

		(checkS3Connection as jest.Mock).mockResolvedValue(true); // Mock S3 connection as healthy
		(checkRabbitConnection as jest.Mock).mockReturnValue(false); // Mock Rabbit connection as unhealthy
		(checkChesHealth as jest.Mock).mockResolvedValue({ success: true }); // Mock CHES health as healthy

		await services(req, res, next);

		expect(checkS3Connection).toHaveBeenCalled();
		expect(checkRabbitConnection).toHaveBeenCalled();
		expect(checkChesHealth).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(503);
		expect(res.json).toHaveBeenCalledWith({
			data: {
				s3: true,
				rabbit: false,
				ches: true,
			},
			message,
			success: false,
		});
	});

	// Test case: CHES service is unhealthy
	it("Test case: CHES service is unhealthy", async () => {
		const req = mockRequest();
		const res = mockResponse();
		const next = jest.fn();
		const message = "One or more services are unhealthy.";

		(checkS3Connection as jest.Mock).mockResolvedValue(true); // Mock S3 connection as healthy
		(checkRabbitConnection as jest.Mock).mockReturnValue(true); // Mock Rabbit connection as healthy
		(checkChesHealth as jest.Mock).mockResolvedValue({ success: false }); // Mock CHES health as unhealthy

		await services(req, res, next);

		expect(checkS3Connection).toHaveBeenCalled();
		expect(checkRabbitConnection).toHaveBeenCalled();
		expect(checkChesHealth).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(503);
		expect(res.json).toHaveBeenCalledWith({
			data: {
				s3: true,
				rabbit: true,
				ches: false,
			},
			message,
			success: false,
		});
	});
});
