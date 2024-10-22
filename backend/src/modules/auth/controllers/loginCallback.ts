import type { Request, Response } from "express";
import { getTokens } from "@bcgov/citz-imb-sso-js-core";
import type { SSOEnvironment, SSOProtocol } from "@bcgov/citz-imb-sso-js-core";
import { ENV } from "src/config";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";

const { SSO_ENVIRONMENT, SSO_REALM, SSO_PROTOCOL, SSO_CLIENT_ID, SSO_CLIENT_SECRET, BACKEND_URL } =
	ENV;

export const loginCallback = errorWrapper(async (req: Request, res: Response) => {
	const { code } = req.query;

	const tokens = await getTokens({
		code: code as string,
		clientID: SSO_CLIENT_ID,
		clientSecret: SSO_CLIENT_SECRET,
		redirectURI: `${BACKEND_URL}/auth/login/callback`,
		ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
		ssoRealm: SSO_REALM,
		ssoProtocol: SSO_PROTOCOL as SSOProtocol,
	});

	// Sets tokens
	res
		.cookie("refresh_token", tokens.refresh_token, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
		})
		.cookie("access_token", tokens.access_token, {
			secure: true,
			sameSite: "none",
		})
		.cookie("id_token", tokens.id_token, {
			secure: true,
			sameSite: "none",
		})
		.cookie("expires_in", tokens.expires_in, {
			secure: true,
			sameSite: "none",
		})
		.cookie("refresh_expires_in", tokens.refresh_expires_in, {
			secure: true,
			sameSite: "none",
		})
		.status(200)
		.json(tokens);
});
