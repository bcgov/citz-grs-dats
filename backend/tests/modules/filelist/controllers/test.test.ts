import type { NextFunction, Request, Response } from "express";
import { test } from "@/modules/filelist/controllers/test";
import {
	HTTP_STATUS_CODES,
	type StandardResponseInput,
	type StandardResponse,
} from "@bcgov/citz-imb-express-utilities";
import { createExcelWorkbook } from "@/modules/filelist/utils";
import { createJsonFileList } from "@/modules/filelist/utils";
import type { Workbook } from "exceljs";

jest.mock("@/modules/filelist/utils", () => ({
	createExcelWorkbook: jest.fn(),
	createJsonFileList: jest.fn(),
}));

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");
	return {
		...originalModule,
		errorWrapper: (fn: unknown) => fn,
	};
});

describe("Test suite for test function", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;
	let sendMock: jest.Mock;

	beforeEach(() => {
		sendMock = jest.fn();
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({
			json: jsonMock,
			send: sendMock,
		}); // Proper chaining support for .status()
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
		};
		mockRes = {
			status: statusMock,
			set: jest.fn(),
			json: jsonMock,
			send: sendMock,
		} as Partial<Response>;
		mockNext = jest.fn();
		jest.clearAllMocks();
	});

	it('Test case: Should return a created Excel file when outputFileType is "excel"', async () => {
		const body = {
			outputFileType: "excel",
			metadata: {
				admin: {
					application: "TestApp",
					accession: "TestAccession",
				},
				folders: {
					folder1: { size: 100 },
				},
				files: {
					file1: [{ name: "file1.txt", size: 50 }],
				},
			},
		};

		mockReq.getZodValidatedBody = jest.fn().mockReturnValue(body);

		const mockWorkbook = {
			xlsx: { writeBuffer: jest.fn().mockResolvedValue(Buffer.from("test buffer")) },
		} as unknown as Workbook;

		(createExcelWorkbook as jest.Mock).mockReturnValue(mockWorkbook);

		await test(mockReq as Request, mockRes as Response, mockNext);

		expect(createExcelWorkbook).toHaveBeenCalledWith({
			folderRows: [
				{
					folder: "folder1",
					size: 100,
				},
			],
			fileRows: [{ name: "file1.txt", size: 50 }],
			application: "TestApp",
			accession: "TestAccession",
		});

		expect(mockRes.set).toHaveBeenCalledWith({
			"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"Content-Disposition": expect.stringContaining("attachment;"),
			"Content-Length": expect.any(Number),
		});

		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
		expect(mockRes.send).toHaveBeenCalledWith(Buffer.from("test buffer"));
	});

	it('Test case: Should return a created JSON file when outputFileType is "json"', async () => {
		const body = {
			outputFileType: "json",
			metadata: {
				admin: {
					application: "TestApp",
					accession: "TestAccession",
				},
				folders: {
					folder1: { size: 100 },
				},
				files: {
					file1: [{ name: "file1.txt", size: 50 }],
				},
			},
		};

		mockReq.getZodValidatedBody = jest.fn().mockReturnValue(body);

		const mockJsonFile = {
			admin: {
				lastRevised: expect.any(String),
				application: "TestApp",
				accession: "TestAccession",
				ministry: "",
				branch: "",
			},
			folderList: body.metadata.folders,
			metadata: body.metadata.files,
		};

		(createJsonFileList as jest.Mock).mockReturnValue(mockJsonFile);

		await test(mockReq as Request, mockRes as Response, mockNext);

		expect(createJsonFileList).toHaveBeenCalledWith({
			accession: body.metadata.admin.accession,
			application: body.metadata.admin.application,
			folders: body.metadata.folders,
			files: body.metadata.files,
		});

		expect(mockRes.set).toHaveBeenCalledWith({
			"Content-Type": "application/json",
			"Content-Disposition": expect.stringContaining("attachment;"),
			"Content-Length": expect.any(Number),
		});

		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
		expect(mockRes.send).toHaveBeenCalledWith(Buffer.from(JSON.stringify(mockJsonFile, null, 2)));
	});

	it("Test case: Should return a bad request for an invalid outputFileType", async () => {
		const body = {
			outputFileType: "invalid",
			metadata: {
				folders: {},
				files: {},
			},
		};

		mockReq.getZodValidatedBody = jest.fn().mockReturnValue(body);

		await test(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
		expect(mockRes.json).toHaveBeenCalledWith({
			success: false,
			data: undefined,
			message: "Invalid output file type.",
		});
	});
});
