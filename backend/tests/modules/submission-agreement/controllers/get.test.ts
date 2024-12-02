import type { Request, Response, NextFunction } from "express";
import { get } from "@/modules/submission-agreement/controllers/get";
import { HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";

describe("get", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let statusMock: jest.Mock;
	let sendMock: jest.Mock;

	beforeEach(() => {
		mockReq = {}; // No specific request data needed for this handler

		sendMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ send: sendMock });
		mockRes = {
			status: statusMock,
		} as Partial<Response>;

		jest.clearAllMocks();
	});

	it("should return the submission agreement text with HTTP 200 status", async () => {
		// Call the function
		await get(mockReq as Request, mockRes as Response, jest.fn() as NextFunction);

		// Assertions
		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
		expect(sendMock).toHaveBeenCalledWith(
			expect.stringContaining("BC GOVERNMENT DIGITAL ARCHIVES"),
		);
		expect(sendMock).toHaveBeenCalledWith(
			expect.stringContaining(
				"This is an agreement between BC's Digital Archives and the Ministry, for the transfer of government records under Accession # ________ and Application # ________.",
			),
		);
	});
});
