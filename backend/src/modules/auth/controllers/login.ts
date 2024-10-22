import type { Request, Response } from "express";
import { getLoginURL } from "@bcgov/citz-imb-sso-js-core";
import type { SSOEnvironment, SSOProtocol } from "@bcgov/citz-imb-sso-js-core";
import { ENV } from "src/config";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";

const { SSO_ENVIRONMENT, SSO_REALM, SSO_PROTOCOL, SSO_CLIENT_ID, BACKEND_URL } = ENV;

export const login = errorWrapper(async (req: Request, res: Response) => {
	const redirectURL = getLoginURL({
		idpHint: "idir",
		clientID: SSO_CLIENT_ID,
		redirectURI: `${BACKEND_URL}/auth/login/callback`,
		ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
		ssoRealm: SSO_REALM,
		ssoProtocol: SSO_PROTOCOL as SSOProtocol,
	});

	// Redirect the user to the SSO login page
	res.redirect(redirectURL);
});
