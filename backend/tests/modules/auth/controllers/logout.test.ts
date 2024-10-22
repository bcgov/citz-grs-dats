// Mock environment variables
const ENV = {
	SSO_ENVIRONMENT: "Test" as "Dev" | "Test" | "Prod",
	SSO_REALM: "test-realm",
	SSO_PROTOCOL: "openid-connect",
	BACKEND_URL: "http://localhost:3000",
};

// Mocked before imports so it can be defined before controller is initialized
jest.mock("@/config", () => ({
	ENV,
}));

import { logout } from "@/modules/auth/controllers/logout";
import { getLogoutURL } from "@bcgov/citz-imb-sso-js-core";
import type { Request, Response, NextFunction } from "express";

jest.mock("@bcgov/citz-imb-sso-js-core", () => ({
	getLogoutURL: jest.fn(),
}));

describe("Logout controller", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;
	let redirectMock: jest.Mock;

	beforeEach(() => {
		req = {
			query: { id_token: "test-id-token" },
		};

		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		redirectMock = jest.fn();

		res = {
			status: statusMock,
			redirect: redirectMock,
		};

		next = jest.fn();
	});

	// Test case: should redirect to the SSO logout URL on success
	it("should redirect to the SSO logout URL on success", async () => {
		// Arrange: mock getLogoutURL to return a test URL
		const mockRedirectURL = "http://sso-logout-url";
		(getLogoutURL as jest.Mock).mockReturnValue(mockRedirectURL);

		// Act: call the logout function
		await logout(req as Request, res as Response, next);

		// Assert: verify redirection to the correct URL
		expect(getLogoutURL).toHaveBeenCalledWith({
			idToken: "test-id-token",
			postLogoutRedirectURI: `${ENV.BACKEND_URL}/auth/logout/callback`,
			ssoEnvironment: ENV.SSO_ENVIRONMENT,
			ssoProtocol: ENV.SSO_PROTOCOL,
			ssoRealm: ENV.SSO_REALM,
		});
		expect(redirectMock).toHaveBeenCalledWith(mockRedirectURL);
		expect(statusMock).not.toHaveBeenCalled();
	});

	// Test case: should return 500 and error message on failure
	it("should return 500 and error message on failure", async () => {
		// Arrange: mock getLogoutURL to throw an error
		(getLogoutURL as jest.Mock).mockImplementation(() => {
			throw new Error("Logout error");
		});

		// Act: call the logout function
		await logout(req as Request, res as Response, next);

		// Assert: verify response status and error message
		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			error: "Logout error",
		});
		expect(redirectMock).not.toHaveBeenCalled();
	});

	// Test case: should return 500 with "An unknown error occurred during logout."
	it('should return 500 with "An unknown error occurred during logout."', async () => {
		// Arrange: mock getLogoutURL to throw a non-standard error (e.g., a number)
		(getLogoutURL as jest.Mock).mockImplementation(() => {
			throw 123; // Simulate a non-standard error
		});

		// Act: call the logout function
		await logout(req as Request, res as Response, next);

		// Assert: verify response status and error message
		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			error: "An unknown error occurred during logout.",
		});
		expect(redirectMock).not.toHaveBeenCalled();
	});
});
