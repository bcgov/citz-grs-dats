import type { NextFunction, Request, Response } from "express";
import { create } from "@/modules/transfer/controllers/create";
import { TransferService } from "@/modules/transfer/services";
import {
	HTTP_STATUS_CODES,
	type StandardResponse,
	type StandardResponseInput,
} from "@bcgov/citz-imb-express-utilities";
import { upload } from "@/modules/s3/utils";
import { addToStandardTransferQueue } from "@/modules/rabbit/utils/queue/transfer";
import { getMetadata } from "@/modules/transfer/utils";
import type { SSOUser } from "@bcgov/citz-imb-sso-js-core";

jest.mock("@/modules/transfer/services", () => ({
	TransferService: {
		createOrUpdateTransferEntry: jest.fn(),
	},
}));

jest.mock("@/modules/s3/utils", () => ({
	download: jest.fn(),
	upload: jest.fn(),
}));

jest.mock("@/modules/rabbit/utils/queue/transfer", () => ({
	addToStandardTransferQueue: jest.fn(),
}));

jest.mock("@/modules/transfer/utils", () => ({
	getMetadata: jest.fn(),
	validateStandardTransferStructure: jest.fn(),
	validateMetadataFiles: jest.fn(),
	validateDigitalFileList: jest.fn(),
	validateSubmissionAgreement: jest.fn(),
	addFileToZipBuffer: jest.fn().mockResolvedValue(Buffer.from("updatedBuffer")),
	getFileFromZipBuffer: jest.fn().mockResolvedValue(Buffer.from("fileBuffer")),
	isChecksumValid: jest.fn().mockReturnValue(true),
	getFilenameByRegex: jest
		.fn()
		.mockImplementation(({ regex }: { regex: RegExp }) =>
			regex.test("Submission_Agreement.pdf") ? "documentation/Submission_Agreement.pdf" : null,
		),
}));

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
				first_name: "Test",
				last_name: "User",
				email: "testuser@example.com",
			} as SSOUser<unknown>,
			file: {
				buffer: Buffer.from("testBuffer"),
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} as any,
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

	it("Test case: Should add a job to the queue and respond with success", async () => {
		jest.spyOn(Date, "now").mockReturnValue(1234567890); // Mock Date.now()
		const jobID = "job-1234567890";
		const validatedBody = {
			checksum: "238c744a21f0db2a4ace004295607fa27b13d2f0d57881c7c5e9f1b3258b4b01",
			accession: "TestAccession",
			application: "TestApplication",
		};
		const metadata = {
			folders: [{ name: "folder1" }],
			files: [{ name: "file1" }],
		};

		(mockReq.getZodValidatedBody as jest.Mock).mockReturnValue(validatedBody);
		(getMetadata as jest.Mock).mockResolvedValue(metadata);
		(upload as jest.Mock).mockResolvedValue("s3://bucket/path/to/file.zip");

		await create(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.getZodValidatedBody).toHaveBeenCalledWith(expect.anything());
		expect(TransferService.createOrUpdateTransferEntry).toHaveBeenCalledWith({
			accession: validatedBody.accession,
			application: validatedBody.application,
			jobID,
			checksum: "238c744a21f0db2a4ace004295607fa27b13d2f0d57881c7c5e9f1b3258b4b01",
			status: "Transferring",
			user: mockReq.user,
			folders: metadata.folders,
			files: metadata.files,
		});
		expect(upload).toHaveBeenCalledWith({
			bucketName: expect.any(String),
			key: `transfers/TR_${validatedBody.accession}_${validatedBody.application}.zip`,
			content: expect.any(Buffer),
		});
		expect(addToStandardTransferQueue).toHaveBeenCalledWith(jobID);
		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
		expect(jsonMock).toHaveBeenCalledWith({
			success: true,
			data: {
				user: "Test User",
				jobID,
				accession: validatedBody.accession,
				application: validatedBody.application,
				fileLocation: "s3://bucket/path/to/file.zip",
				note: "",
			},
			message: "Job added to queue.",
		});
	});
});
