// Mocked before imports so it can be defined before controller is initialized
jest.mock("@/config", () => ({
	ENV: {
		SSO_ENVIRONMENT: "Test" as "Dev" | "Test" | "Prod",
		SSO_REALM: "test-realm",
		SSO_PROTOCOL: "openid-connect",
		SSO_CLIENT_ID: "test-client-id",
		SSO_CLIENT_SECRET: "test-client-secret",
	},
}));

import { token } from "@/modules/auth/controllers/token";
import { getNewTokens } from "@bcgov/citz-imb-sso-js-core";
import type { Request, Response, NextFunction } from "express";
import type { StandardResponse, StandardResponseInput } from "@bcgov/citz-imb-express-utilities";

jest.mock("@bcgov/citz-imb-sso-js-core", () => ({
	getNewTokens: jest.fn(),
}));

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");

	return {
		...originalModule,
		safePromise: jest.fn(),
		errorWrapper: (fn: unknown) => fn,
	};
});

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
		expect(jsonMock).toHaveBeenCalledWith({
			data: mockTokens,
			success: true,
			message: "Token successful.",
		});
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
});
