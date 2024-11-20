import { HttpError, safePromise } from "@bcgov/citz-imb-express-utilities";
import { fetchToken } from "./fetchToken";
import { ENV } from "src/config";
import type { EmailData } from "../schemas";

const { CHES_URL } = ENV;

export const sendEmail = async ({
	attachments,
	bcc,
	bodyType = "text",
	body,
	cc,
	from = "no-reply@dats.gov.bc.ca",
	priority,
	subject,
	to,
	delayTS,
}: EmailData): Promise<{ data: unknown; success: boolean }> => {
	// Fetch token for CHES auth.
	const [fetchTokenError, tokenResponse] = await fetchToken();
	if (fetchTokenError) throw fetchTokenError;

	const { access_token } = await tokenResponse.json();

	// Get access token.
	if (!access_token)
		throw new HttpError(404, "Missing access_token in CHES token endpoint response.");

	// Call CHES /email endpoint using safePromise
	const [emailError, emailResponse] = await safePromise(
		fetch(`${CHES_URL}/email`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				attachments,
				bcc,
				bodyType,
				body,
				cc,
				from,
				priority,
				subject,
				to,
				delayTS,
			}),
		}),
	);
	if (emailError) throw emailError;

	// Check if the response is OK
	if (!emailResponse?.ok) {
		const data = await emailResponse.json();
		const errorMessage = `CHES email endpoint returned an error: (${emailResponse?.status ?? 400}) ${emailResponse?.statusText} - ${JSON.stringify(data, null, 2)}`;
		throw new HttpError(emailResponse?.status ?? 400, errorMessage);
	}

	const data = await emailResponse.json();

	return { data, success: true };
};
