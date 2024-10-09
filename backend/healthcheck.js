import https from "node:https";

const { BACKEND_PORT } = process.env;
const healthUrl = `http://localhost${BACKEND_PORT}/health`;

/**
 * Make a request to the health endpoint.
 * If it returns a 200 status, exit the script with exitCode 0 (terminated with success).
 * If it returns any other status, exit the script with exitCode 1 (terminated with error).
 */
const req = https.request(healthUrl, (res) => {
	process.exitCode = res.statusCode === 200 ? 0 : 1;
});

req.on("error", (error) => {
	console.error(`Healthcheck failed with error: ${error}`);
	process.exit(1);
});

req.end();
