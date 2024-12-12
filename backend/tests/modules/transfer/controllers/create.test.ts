import type { NextFunction, Request, Response } from "express";
import { create } from "@/modules/transfer/controllers/create";
import { TransferService } from "@/modules/transfer/services";
import {
	HTTP_STATUS_CODES,
	type StandardResponse,
	type StandardResponseInput,
} from "@bcgov/citz-imb-express-utilities";
import type { SSOUser } from "@bcgov/citz-imb-sso-js-core";

jest.mock("@/modules/transfer/services", () => ({
	TransferService: {
		updateTransferEntry: jest.fn(),
	},
}));

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");
	return {
		...originalModule,
		errorWrapper: (fn: unknown) => fn,
	};
});

describe("Test suite for create function", () => {
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

	it("Test case: Should add a job to the queue with mocked job ID", async () => {
		jest.spyOn(Date, "now").mockReturnValue(1234567890); // Mock Date.now()
		const jobID = "job-1234567890";
		const validatedBody = {
			accession: "TestAccession",
			application: "TestApplication",
		};

		(mockReq.getZodValidatedBody as jest.Mock).mockReturnValue(validatedBody);

		await create(mockReq as Request, mockRes as Response, mockNext);

		expect(TransferService.updateTransferEntry).toHaveBeenCalledWith(
			"TestAccession",
			"TestApplication",
			expect.objectContaining({
				jobID,
				status: "Transferring",
			}),
		);
		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
		expect(jsonMock).toHaveBeenCalledWith({
			success: true,
			data: { jobID },
			message: "Job added to queue.",
		});
	});
});
