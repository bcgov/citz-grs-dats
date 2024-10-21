// Mock environment variables
const ENV = {
	SSO_ENVIRONMENT: "Test" as "Dev" | "Test" | "Prod",
	SSO_REALM: "test-realm",
	SSO_PROTOCOL: "openid-connect",
	SSO_CLIENT_ID: "test-client-id",
	SSO_CLIENT_SECRET: "test-client-secret",
};

// Mocked before imports so it can be defined before controller is initialized
jest.mock("@/config", () => ({
	ENV,
}));

import { token } from "@/modules/auth/controllers/token";
import { getNewTokens } from "@bcgov/citz-imb-sso-js-core";
import type { Request, Response, NextFunction } from "express";

jest.mock("@bcgov/citz-imb-sso-js-core", () => ({
	getNewTokens: jest.fn(),
}));

describe("token controller", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;
	let cookieMock: jest.Mock;

	beforeEach(() => {
		req = {
			cookies: { refresh_token: "test-refresh-token" },
		};

		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });

		cookieMock = jest.fn((name, value, options) => {
			return res; // Return res to enable chaining
		});

		res = {
			status: statusMock,
			json: jsonMock,
			cookie: cookieMock,
		};

		next = jest.fn();
		(getNewTokens as jest.Mock).mockReset();
	});

	// Test case: should set access_token and return 200 on success
	it("should set access_token and return 200 on success", async () => {
		// Arrange: mock getNewTokens to return valid tokens
		const mockTokens = {
			access_token: "test-access-token",
			id_token: "test-id-token",
			expires_in: 3600,
		};
		(getNewTokens as jest.Mock).mockResolvedValue(mockTokens);

		// Act: call the token function
		await token(req as Request, res as Response, next);

		// Assert: verify that cookies are set correctly
		expect(cookieMock).toHaveBeenCalledWith("access_token", "test-access-token", {
			secure: true,
			sameSite: "none",
		});
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith(mockTokens);
	});

	// Test case: should return 401 if refresh_token is missing
	it("should return 401 if refresh_token is missing", async () => {
		// Arrange: remove refresh_token from cookies
		req.cookies = {};

		// Act: call the token function
		await token(req as Request, res as Response, next);

		// Assert: verify response status and message
		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			message: "Refresh token is missing. Please log in again.",
		});
		expect(cookieMock).not.toHaveBeenCalled();
	});

	// Test case: should return 401 if tokens are invalid
	it("should return 401 if tokens are invalid", async () => {
		// Arrange: mock getNewTokens to return null (invalid token)
		(getNewTokens as jest.Mock).mockResolvedValue(null);

		// Act: call the token function
		await token(req as Request, res as Response, next);

		// Assert: verify response status and message
		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			message: "Invalid token.",
		});
		expect(cookieMock).not.toHaveBeenCalled();
	});

	// Test case: should return 500 with "Couldn't get access or id token from KC token endpoint"
	it('should return 500 with "Couldn\'t get access or id token from KC token endpoint"', async () => {
		// Arrange: mock getNewTokens to throw an error
		(getNewTokens as jest.Mock).mockImplementation(() => {
			throw new Error("Couldn't get access or id token from KC token endpoint");
		});

		// Act: call the token function
		await token(req as Request, res as Response, next);

		// Assert: verify response status and error message
		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			error: "Couldn't get access or id token from KC token endpoint",
		});
	});

	// Test case: should return 500 with "An unknown error occurred while refreshing tokens."
	it('should return 500 with "An unknown error occurred while refreshing tokens."', async () => {
		// Arrange: mock getNewTokens to throw a non-standard error
		(getNewTokens as jest.Mock).mockImplementation(() => {
			throw 123; // Simulate a non-standard error
		});

		// Act: call the token function
		await token(req as Request, res as Response, next);

		// Assert: verify response status and error message
		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			error: "An unknown error occurred while refreshing tokens.",
		});
	});
});
