import type { NextFunction, Request, Response } from "express";
import { create } from "@/modules/filelist/controllers/create";
import { FileListService } from "@/modules/filelist/service";
import { TransferService } from "@/modules/transfer/service";
import { createFileListBodySchema } from "@/modules/filelist/schemas";
import {
	HTTP_STATUS_CODES,
	type StandardResponse,
	type StandardResponseInput,
} from "@bcgov/citz-imb-express-utilities";
import type { SSOUser } from "@bcgov/citz-imb-sso-js-core";

jest.mock("@/modules/filelist/service", () => ({
	FileListService: {
		createFileListEntry: jest.fn(),
	},
}));

jest.mock("@/modules/transfer/service", () => ({
	TransferService: {
		createTransferEntry: jest.fn(),
	},
}));

jest.mock("@/modules/rabbit/utils/queue", () => ({
	addToCreateFileListQueue: jest.fn(),
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
			json: jsonMock, // Ensuring `json` works directly
		} as Partial<Response>;

		mockNext = jest.fn();
		jest.clearAllMocks();
	});

	it("Test case: Should successfully create a job and add it to the queue", async () => {
		jest.spyOn(Date, "now").mockReturnValue(1234567890); // Mock Date.now()
		const jobID = "job-1234567890";
		const body = {
			outputFileType: "pdf",
			metadata: {
				admin: {
					application: "TestApp",
					accession: "TestAccession",
				},
				folders: ["folder1"],
				files: ["file1"],
			},
		};

		mockReq.getZodValidatedBody = jest.fn().mockReturnValue(body);

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		jest.spyOn(FileListService, "createFileListEntry").mockResolvedValue({} as any);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		jest.spyOn(TransferService, "createTransferEntry").mockResolvedValue({} as any);
		const addToQueueSpy = jest
			.spyOn(require("@/modules/rabbit/utils/queue"), "addToCreateFileListQueue")
			.mockResolvedValue(undefined);

		await create(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.getZodValidatedBody).toHaveBeenCalledWith(createFileListBodySchema);
		expect(FileListService.createFileListEntry).toHaveBeenCalledWith({
			jobID,
			outputFileType: body.outputFileType,
			metadata: {
				admin: {
					application: body.metadata.admin.application,
					accession: body.metadata.admin.accession,
					submittedBy: {
						name: "Test User",
						email: "testuser@example.com",
					},
				},
				folders: body.metadata.folders,
				files: body.metadata.files,
			},
		});
		expect(TransferService.createTransferEntry).toHaveBeenCalledWith({
			metadata: {
				admin: {
					application: body.metadata.admin.application,
					accession: body.metadata.admin.accession,
					submittedBy: {
						name: "Test User",
						email: "testuser@example.com",
					},
				},
				folders: body.metadata.folders,
				files: body.metadata.files,
			},
		});
		expect(addToQueueSpy).toHaveBeenCalledWith(jobID);
		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
		expect(mockRes.json).toHaveBeenCalledWith({
			success: true,
			data: { jobID },
			message: "Job added to queue.",
		});
	});
});
