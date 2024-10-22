import type { Request, Response } from "express";
import { getLogoutURL } from "@bcgov/citz-imb-sso-js-core";
import type { SSOEnvironment, SSOProtocol } from "@bcgov/citz-imb-sso-js-core";
import { ENV } from "src/config";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";

const { SSO_ENVIRONMENT, SSO_REALM, SSO_PROTOCOL, BACKEND_URL } = ENV;

export const logout = errorWrapper(async (req: Request, res: Response) => {
	try {
		const { id_token } = req.query;

		const redirectURL = getLogoutURL({
			idToken: id_token as string,
			postLogoutRedirectURI: `${BACKEND_URL}/auth/logout/callback`,
			ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
			ssoProtocol: SSO_PROTOCOL as SSOProtocol,
			ssoRealm: SSO_REALM,
		});

		res.redirect(redirectURL);
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : "An unknown error occurred during logout.",
		});
	}
});
