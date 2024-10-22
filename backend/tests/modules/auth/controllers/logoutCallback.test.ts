import { logoutCallback } from "@/modules/auth/controllers/logoutCallback";
import type { Request, Response, NextFunction } from "express";

describe("logoutCallback controller", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let statusMock: jest.Mock;
	let sendMock: jest.Mock;

	beforeEach(() => {
		req = {};

		sendMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ send: sendMock });

		res = {
			status: statusMock,
			send: sendMock,
		};

		next = jest.fn();
	});

	// Test case: should return 204 and "Logged out." on success
	it('should return 204 and "Logged out." on success', async () => {
		// Act: call the logoutCallback function
		await logoutCallback(req as Request, res as Response, next);

		// Assert: verify response status and message
		expect(statusMock).toHaveBeenCalledWith(204);
		expect(sendMock).toHaveBeenCalledWith("Logged out.");
	});
});
