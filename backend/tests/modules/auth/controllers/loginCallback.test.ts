// Mocked before imports so it can be defined before controller is initialized
jest.mock("@/config", () => ({
	ENV: {
		SSO_ENVIRONMENT: "Test",
		SSO_REALM: "test-realm",
		SSO_PROTOCOL: "openid-connect",
		SSO_CLIENT_ID: "test-client-id",
		SSO_CLIENT_SECRET: "test-client-secret",
		BACKEND_URL: "http://localhost:3000",
	},
}));

import { loginCallback } from "@/modules/auth/controllers/loginCallback";
import { getTokens } from "@bcgov/citz-imb-sso-js-core";
import type { NextFunction, Request, Response } from "express";
import type { StandardResponse, StandardResponseInput } from "@bcgov/citz-imb-express-utilities";

jest.mock("@bcgov/citz-imb-sso-js-core", () => ({
	getTokens: jest.fn(),
}));

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");

	return {
		...originalModule,
		safePromise: jest.fn(),
		errorWrapper: (fn: unknown) => fn,
	};
});

describe("loginCallback controller", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;
	let cookieMock: jest.Mock;

	beforeEach(() => {
		req = {
			query: { code: "test-code" },
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
	});

	// Test case: should set tokens in cookies and return 200 on success
	it("should set tokens in cookies and return 200 on success", async () => {
		// Arrange: mock getTokens to return fake tokens
		const mockTokens = {
			access_token: "test-access-token",
			id_token: "test-id-token",
			refresh_token: "test-refresh-token",
			expires_in: "3600",
			refresh_expires_in: "7200",
		};
		(getTokens as jest.Mock).mockResolvedValue(mockTokens);

		// Act: call the loginCallback function
		await loginCallback(req as Request, res as Response, next);

		// Assert: verify that cookies are set correctly
		expect(cookieMock).toHaveBeenCalledTimes(5);
		expect(cookieMock).toHaveBeenNthCalledWith(1, "refresh_token", "test-refresh-token", {
			httpOnly: true,
			secure: true,
			sameSite: "none",
		});
		expect(cookieMock).toHaveBeenNthCalledWith(2, "access_token", "test-access-token", {
			secure: true,
			sameSite: "none",
		});
		expect(cookieMock).toHaveBeenNthCalledWith(3, "id_token", "test-id-token", {
			secure: true,
			sameSite: "none",
		});
		expect(cookieMock).toHaveBeenNthCalledWith(4, "expires_in", "3600", {
			secure: true,
			sameSite: "none",
		});
		expect(cookieMock).toHaveBeenNthCalledWith(5, "refresh_expires_in", "7200", {
			secure: true,
			sameSite: "none",
		});

		// Assert: verify that the response returns 200 and tokens
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			data: mockTokens,
			success: true,
			message: "Login callback successful.",
		});
	});
});
