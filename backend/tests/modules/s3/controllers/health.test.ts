import type { NextFunction, Request, Response } from "express";
import { health } from "@/modules/s3/controllers/health";
import { checkS3Connection } from "@/modules/s3/utils";

// Mock checkS3Connection function
jest.mock("@/modules/s3/utils", () => ({
	checkS3Connection: jest.fn(),
}));

describe("health controller", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		req = {};
		jsonMock = jest.fn();
		statusMock = jest.fn(() => ({ json: jsonMock }));
		res = { status: statusMock } as Partial<Response>;
		next = jest.fn();

		jest.clearAllMocks(); // Clear previous mocks before each test
	});

	// Test case: Should return 200 when S3 connection is successful
	it("should return 200 if S3 connection is successful", async () => {
		(checkS3Connection as jest.Mock).mockResolvedValue(true);

		await health(req as Request, res as Response, next);

		expect(checkS3Connection).toHaveBeenCalled();
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			success: true,
			message: "S3 connection successful",
		});
	});

	// Test case: Should return 500 when S3 connection fails
	it("should return 500 if S3 connection fails", async () => {
		(checkS3Connection as jest.Mock).mockResolvedValue(false);

		await health(req as Request, res as Response, next);

		expect(checkS3Connection).toHaveBeenCalled();
		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			message: "S3 connection failed",
		});
	});
});
