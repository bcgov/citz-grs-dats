import { decodeJWT, normalizeUser } from "@bcgov/citz-imb-sso-js-core";
import type { IdirIdentityProvider, OriginalSSOUser, SSOUser } from "@bcgov/citz-imb-sso-js-core";

// Get user details from the decoded token
export const getUser = (
	accessToken: string | undefined,
): SSOUser<IdirIdentityProvider> | undefined => {
	if (!accessToken) return undefined;

	const decoded = decodeJWT(accessToken) as OriginalSSOUser<IdirIdentityProvider>;
	return normalizeUser(decoded);
};
