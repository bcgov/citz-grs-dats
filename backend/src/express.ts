import {
	expressUtilitiesMiddleware,
	healthModule,
	configModule,
} from "@bcgov/citz-imb-express-utilities";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { CORS_OPTIONS, RATE_LIMIT_OPTIONS } from "./config";
import { ENV } from "./config";

const { ENVIRONMENT } = ENV;

// Define Express App
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors(CORS_OPTIONS));
app.use(rateLimit(RATE_LIMIT_OPTIONS));

// Disabled because it exposes information about the used framework to potential attackers.
app.disable("x-powered-by");

// Add express utils middleware.
app.use(expressUtilitiesMiddleware);

// Routing
healthModule(app); // Route (/health)
configModule(app, { ENVIRONMENT }); // Route (/config)

export default app;
