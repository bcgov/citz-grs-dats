import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import type { Request, Response } from "express";

// This endpoint is only needed because SSO needs to redirect somewhere
// and the desktop application does not have a URL to redirect to.
export const logoutCallback = errorWrapper(async (req: Request, res: Response) => {
	res.status(204).send("Logged out.");
});
