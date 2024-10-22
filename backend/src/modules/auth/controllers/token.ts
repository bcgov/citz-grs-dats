import type { Request, Response } from "express";
import { getNewTokens } from "@bcgov/citz-imb-sso-js-core";
import type { SSOEnvironment, SSOProtocol } from "@bcgov/citz-imb-sso-js-core";
import { ENV } from "src/config";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";

const { SSO_ENVIRONMENT, SSO_REALM, SSO_PROTOCOL, SSO_CLIENT_ID, SSO_CLIENT_SECRET } = ENV;

export const token = errorWrapper(async (req: Request, res: Response) => {
	const refresh_token = req.cookies.refresh_token;

	if (!refresh_token)
		return res.status(401).json({
			success: false,
			message: "Refresh token is missing. Please log in again.",
		});

	const tokens = await getNewTokens({
		refreshToken: refresh_token as string,
		clientID: SSO_CLIENT_ID,
		clientSecret: SSO_CLIENT_SECRET,
		ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
		ssoRealm: SSO_REALM,
		ssoProtocol: SSO_PROTOCOL as SSOProtocol,
	});

	if (!tokens) return res.status(401).json({ success: false, message: "Invalid token." });

	// Set token
	res
		.cookie("access_token", tokens.access_token, {
			secure: true,
			sameSite: "none",
		})
		.status(200)
		.json(tokens);
});
