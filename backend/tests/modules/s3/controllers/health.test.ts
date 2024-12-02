import type { NextFunction, Request, Response } from "express";
import { health } from "@/modules/s3/controllers/health";
import { checkS3Connection } from "@/modules/s3/utils";
import type { StandardResponse, StandardResponseInput } from "@bcgov/citz-imb-express-utilities";
import type { ListBucketsOutput } from "@aws-sdk/client-s3";

// Mock checkS3Connection function
jest.mock("@/modules/s3/utils", () => ({
	checkS3Connection: jest.fn(),
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
		res = { status: statusMock } as Partial<Response>;
		next = jest.fn();

		jest.clearAllMocks(); // Clear previous mocks before each test
	});

	// Test case: Should return 200 when S3 connection is successful
	it("should return 200 if S3 connection is successful", async () => {
		const mockBuckets: ListBucketsOutput = { Buckets: [{ Name: "bucket1" }, { Name: "bucket2" }] };
		(checkS3Connection as jest.Mock).mockResolvedValue({
			healthy: true,
			buckets: mockBuckets,
		});

		await health(req as Request, res as Response, next);

		expect(checkS3Connection).toHaveBeenCalled();
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			success: true,
			data: mockBuckets,
			message: "S3 connection successful.",
		});
	});

	// Test case: Should return 503 when S3 connection fails
	it("should return 503 if S3 connection fails", async () => {
		const mockBuckets: ListBucketsOutput = { Buckets: [] };
		(checkS3Connection as jest.Mock).mockResolvedValue({
			healthy: false,
			buckets: mockBuckets,
		});

		await health(req as Request, res as Response, next);

		expect(checkS3Connection).toHaveBeenCalled();
		expect(statusMock).toHaveBeenCalledWith(503);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			data: mockBuckets,
			message: "S3 connection failed. Ensure you are on the BC Gov network or VPN.",
		});
	});
});
