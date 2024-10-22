// Mock the environment variables
const ENV = {
	SSO_ENVIRONMENT: "Test",
	SSO_REALM: "test-realm",
	SSO_PROTOCOL: "openid-connect",
	SSO_CLIENT_ID: "test-client-id",
	BACKEND_URL: "http://localhost:3000",
};

// Mocked before imports so it can be defined before controller is initialized
jest.mock("@/config", () => ({
	ENV,
}));

import { login } from "@/modules/auth/controllers/login";
import { getLoginURL } from "@bcgov/citz-imb-sso-js-core";
import type { Request, Response, NextFunction } from "express";

jest.mock("@bcgov/citz-imb-sso-js-core", () => ({
	getLoginURL: jest.fn(),
}));

describe("Login controller", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;
	let redirectMock: jest.Mock;

	beforeEach(() => {
		req = {};
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		redirectMock = jest.fn();

		res = {
			status: statusMock,
			redirect: redirectMock,
		};

		next = jest.fn();
	});

	// Test case: should redirect to the SSO login URL on success
	it("should redirect to the SSO login URL on success", async () => {
		// Arrange: mock getLoginURL to return a test URL
		const mockRedirectURL = "http://sso-login-url";
		(getLoginURL as jest.Mock).mockReturnValue(mockRedirectURL);

		// Act: call the login function
		await login(req as Request, res as Response, next);

		// Assert: verify redirection to the correct URL
		expect(getLoginURL).toHaveBeenCalledWith({
			idpHint: "idir",
			clientID: ENV.SSO_CLIENT_ID,
			redirectURI: `${ENV.BACKEND_URL}/auth/login/callback`,
			ssoEnvironment: ENV.SSO_ENVIRONMENT,
			ssoRealm: ENV.SSO_REALM,
			ssoProtocol: ENV.SSO_PROTOCOL,
		});
		expect(redirectMock).toHaveBeenCalledWith(mockRedirectURL);
		expect(statusMock).not.toHaveBeenCalled();
	});
});
