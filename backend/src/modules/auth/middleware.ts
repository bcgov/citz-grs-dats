import type { Request, Response, NextFunction, RequestHandler } from "express";
import {
	isJWTValid,
	decodeJWT,
	hasAllRoles,
	hasAtLeastOneRole,
	normalizeUser,
} from "@bcgov/citz-imb-sso-js-core";
import type { SSOUser, SSOProtocol, SSOEnvironment } from "@bcgov/citz-imb-sso-js-core";
import { ENV } from "src/config";

const { SSO_CLIENT_ID, SSO_CLIENT_SECRET, SSO_ENVIRONMENT, SSO_PROTOCOL, SSO_REALM } = ENV;

type ProtectedRouteOptions = {
	requireAllRoles?: boolean;
};

declare global {
	namespace Express {
		interface Request {
			token?: string;
			user?: SSOUser<unknown>;
		}
	}
}

export const protectedRoute = (
	roles?: string[],
	options?: ProtectedRouteOptions,
): RequestHandler => {
	const routeMiddleware = async (req: Request, res: Response, next: NextFunction) => {
		// Check if Authorization header exists.
		const header = req.headers.authorization;
		if (!header)
			return res.status(401).json({ success: false, message: "No authorization header found." });

		// Extract token from header and check if it is valid.
		const token = header.split(" ")[1];
		const isTokenValid = await isJWTValid({
			jwt: token,
			clientID: SSO_CLIENT_ID,
			clientSecret: SSO_CLIENT_SECRET,
			ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
			ssoProtocol: SSO_PROTOCOL as SSOProtocol,
			ssoRealm: SSO_REALM,
		});
		if (!isTokenValid)
			return res.status(401).json({
				success: false,
				message: "Unauthorized: Invalid token, re-log to get a new one.",
			});

		// Get user info and check role.
		const userInfo = decodeJWT(token);
		const normalizedUser = normalizeUser<unknown>(userInfo);
		if (!userInfo || !normalizedUser) return res.status(404).json({ error: "User not found." });
		const userRoles = userInfo?.client_roles;

		// Ensure proper use of function.
		if (roles && (!Array.isArray(roles) || !roles.every((item) => typeof item === "string")))
			throw new Error("Error: Pass roles as an array of strings to protectedRoute.");

		// Check for roles.
		if (roles) {
			if (options?.requireAllRoles === false) {
				if (!userRoles || !hasAtLeastOneRole(userRoles, roles)) {
					// User does not have at least one of the required roles.
					return res.status(403).json({
						success: false,
						message: `User must have at least one of the following roles: [${roles}]`,
					});
				}
			} else {
				if (!userRoles || !hasAllRoles(userRoles, roles)) {
					// User does not have all the required roles.
					return res.status(403).json({
						sucess: false,
						message: `User must have all of the following roles: [${roles}]`,
					});
				}
			}
		}

		// Set decoded token and user information in request object.
		req.token = token;
		req.user = normalizedUser;

		// Pass control to the next middleware function.
		next();
	};
	return routeMiddleware as RequestHandler;
};
