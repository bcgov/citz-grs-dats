// Mock the ENV variables before importing the middleware
jest.mock("@/config", () => ({
	ENV: {
		SSO_CLIENT_ID: "mockClientId",
		SSO_CLIENT_SECRET: "mockClientSecret",
	},
}));

import type { NextFunction, Request, Response } from "express";
import express from "express";
import request from "supertest";
import { protectedRoute } from "@/modules/auth/middleware";
import {
	isJWTValid,
	decodeJWT,
	normalizeUser,
	hasAllRoles,
	hasAtLeastOneRole,
} from "@bcgov/citz-imb-sso-js-core";
import { expressUtilitiesMiddleware } from "@bcgov/citz-imb-express-utilities";
import type { StandardResponse, StandardResponseInput } from "@bcgov/citz-imb-express-utilities";

// Mock SSO functions
jest.mock("@bcgov/citz-imb-sso-js-core", () => ({
	isJWTValid: jest.fn(),
	decodeJWT: jest.fn(),
	normalizeUser: jest.fn(),
	hasAllRoles: jest.fn(),
	hasAtLeastOneRole: jest.fn(),
}));

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");

	return {
		...originalModule,
		expressUtilitiesMiddleware: (req: Request, res: Response, next: NextFunction) => {
			req.getStandardResponse = <TData>(
				dataInput: StandardResponseInput<TData>,
			): StandardResponse<TData> => {
				const { success = true, data, message } = dataInput;

				return {
					success,
					data,
					message: message ?? "",
				} as StandardResponse<TData>;
			};

			next();
		},
	};
});

// Helper to create an Express app with the middleware
const createAppWithMiddleware = (roles?: string[], options?: { requireAllRoles?: boolean }) => {
	const app = express();
	app.use(express.json());
	app.use(expressUtilitiesMiddleware);
	app.use("/test", protectedRoute(roles ?? undefined, options), (req: Request, res: Response) => {
		res.status(200).json({ message: "YES" });
	});
	return app;
};

describe("protectedRoute middleware", () => {
	// Test case: should return 401 if no authorization header is present
	it("should return 401 if no authorization header is present", async () => {
		const app = createAppWithMiddleware();
		await request(app)
			.get("/test")
			.expect(401, { success: false, message: "No authorization header found." });
	});

	// Test case: should return 401 if token is invalid
	it("should return 401 if token is invalid", async () => {
		(isJWTValid as jest.Mock).mockResolvedValue(false);

		const app = createAppWithMiddleware();
		await request(app).get("/test").set("Authorization", "Bearer invalid-token").expect(401, {
			success: false,
			message: "Unauthorized: Invalid token, re-log to get a new one.",
		});
	});

	// Test case: should return 404 if user info is not found
	it("should return 404 if user info is not found", async () => {
		(isJWTValid as jest.Mock).mockResolvedValue(true);
		(decodeJWT as jest.Mock).mockReturnValue(null);

		const app = createAppWithMiddleware();
		await request(app)
			.get("/test")
			.set("Authorization", "Bearer valid-token")
			.expect(404, { success: false, message: "User not found." });
	});

	// Test case: should return 403 if user does not have at least one required role
	it("should return 403 if user does not have at least one required role", async () => {
		(isJWTValid as jest.Mock).mockResolvedValue(true);
		const mockUserInfo = { client_roles: ["role3"] };
		(decodeJWT as jest.Mock).mockReturnValue(mockUserInfo);
		(normalizeUser as jest.Mock).mockReturnValue(mockUserInfo);
		(hasAtLeastOneRole as jest.Mock).mockReturnValue(false);

		const app = createAppWithMiddleware(["role1", "role2"], { requireAllRoles: false });
		await request(app).get("/test").set("Authorization", "Bearer valid-token").expect(403, {
			success: false,
			message: "User must have at least one of the following roles: [role1,role2]",
		});
	});

	// Test case: should return 403 if user does not have all required roles
	it("should return 403 if user does not have all required roles", async () => {
		(isJWTValid as jest.Mock).mockResolvedValue(true);
		const mockUserInfo = { client_roles: ["role1"] };
		(decodeJWT as jest.Mock).mockReturnValue(mockUserInfo);
		(normalizeUser as jest.Mock).mockReturnValue(mockUserInfo);
		(hasAllRoles as jest.Mock).mockReturnValue(false);

		const app = createAppWithMiddleware(["role1", "role2"]);
		await request(app).get("/test").set("Authorization", "Bearer valid-token").expect(403, {
			success: false,
			message: "User must have all of the following roles: [role1,role2]",
		});
	});

	// Test case: should call next if user passes all checks
	it("should call next if user passes all checks", async () => {
		(isJWTValid as jest.Mock).mockResolvedValue(true);
		const mockUserInfo = { client_roles: ["role1", "role2"] };
		(decodeJWT as jest.Mock).mockReturnValue(mockUserInfo);
		(normalizeUser as jest.Mock).mockReturnValue(mockUserInfo);
		(hasAllRoles as jest.Mock).mockReturnValue(true);

		const app = createAppWithMiddleware(["role1", "role2"]);
		await request(app)
			.get("/test")
			.set("Authorization", "Bearer valid-token")
			.expect(200, { message: "YES" });
	});
});
