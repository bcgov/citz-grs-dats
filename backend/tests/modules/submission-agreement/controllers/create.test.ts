import type { Request, Response, NextFunction } from "express";
import { create } from "@/modules/submission-agreement/controllers/create";
import { createAgreementPDF } from "@/modules/submission-agreement/utils";
import { upload } from "src/modules/s3/utils";
import {
	HTTP_STATUS_CODES,
	type StandardResponse,
	type StandardResponseInput,
} from "@bcgov/citz-imb-express-utilities";
import { ENV } from "@/config";
import type { SSOUser } from "@bcgov/citz-imb-sso-js-core";

// Mock dependencies
jest.mock("@/modules/submission-agreement/utils", () => ({
	createAgreementPDF: jest.fn(),
}));
jest.mock("@/modules/s3/utils", () => ({
	upload: jest.fn(),
}));
jest.mock("@/utils", () => ({
	formatDate: jest.fn(() => "2024-12-01"),
}));
jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");
	return {
		...originalModule,
		errorWrapper: (fn: unknown) => fn,
	};
});

describe("create", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		mockReq = {
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
			getZodValidatedBody: jest.fn(),
			user: {
				display_name: "Test User",
				email: "testuser@example.com",
				first_name: "Test",
				last_name: "User",
			} as SSOUser<unknown>,
		};

		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		mockRes = {
			status: statusMock,
			json: jsonMock,
		} as Partial<Response>;

		mockNext = jest.fn();
		jest.clearAllMocks();
	});

	it("should create a submission agreement and save it to S3", async () => {
		// Mock data
		const mockBody = {
			accession: "123",
			application: "456",
		};
		const mockPDFBuffer = Buffer.from("mock PDF");
		const mockS3Location = "s3://bucket/submission-agreements/123-456";
		const mockStandardResponse = {
			data: {
				signee: "Test User",
				date: "2024-12-01",
				accession: "123",
				application: "456",
				fileLocation: mockS3Location,
			},
			message: "Submission agreement created/accepted.",
			success: true,
		};

		// Mock implementations
		jest.spyOn(mockReq, "getZodValidatedBody").mockReturnValue(mockBody);
		(createAgreementPDF as jest.Mock).mockResolvedValue(mockPDFBuffer);
		(upload as jest.Mock).mockResolvedValue(mockS3Location);

		// Call the function
		await create(mockReq as Request, mockRes as Response, mockNext);

		// Assertions
		expect(mockReq.getZodValidatedBody).toHaveBeenCalledWith(expect.anything()); // Schema validation
		expect(createAgreementPDF).toHaveBeenCalledWith({
			ministrySignature: "Test User",
			ministryDate: "2024-12-01",
			accession: "123",
			application: "456",
		});
		expect(upload).toHaveBeenCalledWith({
			bucketName: ENV.S3_BUCKET,
			key: "submission-agreements/123-456",
			content: mockPDFBuffer,
		});
		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
		expect(mockRes.json).toHaveBeenCalledWith(mockStandardResponse);
	});
});
