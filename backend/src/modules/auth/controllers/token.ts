import type { Request, Response } from "express";
import { getNewTokens } from "@bcgov/citz-imb-sso-js-core";
import type { SSOEnvironment, SSOProtocol } from "@bcgov/citz-imb-sso-js-core";
import { ENV } from "src/config";
import { errorWrapper, HttpError } from "@bcgov/citz-imb-express-utilities";

const { SSO_ENVIRONMENT, SSO_REALM, SSO_PROTOCOL, SSO_CLIENT_ID, SSO_CLIENT_SECRET } = ENV;

export const token = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse } = req;
	const refresh_token = req.cookies.refresh_token;

	if (!SSO_CLIENT_ID || !SSO_CLIENT_SECRET)
		throw new HttpError(400, "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined.");

	if (!refresh_token)
		return res.status(401).json(
			getStandardResponse({
				data: undefined,
				success: false,
				message: "Refresh token is missing. Please log in again.",
			}),
		);

	const tokens = await getNewTokens({
		refreshToken: refresh_token as string,
		clientID: SSO_CLIENT_ID,
		clientSecret: SSO_CLIENT_SECRET,
		ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
		ssoRealm: SSO_REALM,
		ssoProtocol: SSO_PROTOCOL as SSOProtocol,
	});

	if (!tokens)
		return res
			.status(401)
			.json(getStandardResponse({ data: undefined, success: false, message: "Invalid token." }));

	const result = getStandardResponse({
		data: tokens,
		message: "Token successful.",
		success: true,
	});

	// Set token
	res
		.cookie("access_token", tokens.access_token, {
			secure: true,
			sameSite: "none",
		})
		.status(200)
		.json(result);
});
