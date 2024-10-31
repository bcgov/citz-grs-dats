import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { checkS3Connection } from "src/modules/s3/utils";
import { checkRabbitConnection } from "src/modules/rabbit/utils";
import { checkChesHealth } from "src/modules/ches/utils";

export const services = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse } = req;

	const s3Connected = await checkS3Connection();
	const rabbitConnected = checkRabbitConnection();
	const { success: chesHealthy } = await checkChesHealth();

	const allServicesHealthy = s3Connected && rabbitConnected && chesHealthy;

	const data = {
		s3: s3Connected,
		rabbit: rabbitConnected,
		ches: chesHealthy,
	};

	const result = getStandardResponse({
		data,
		message: allServicesHealthy
			? "All services are healthy."
			: "One or more services are unhealthy.",
		success: allServicesHealthy,
	});

	res.status(allServicesHealthy ? 200 : 503).json(result);
});
