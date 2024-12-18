import {
	expressUtilitiesMiddleware,
	healthModule,
	configModule,
} from "@bcgov/citz-imb-express-utilities";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { CORS_OPTIONS, RATE_LIMIT_OPTIONS } from "./config";
import { ENV } from "./config";
import {
	authRouter,
	chesRouter,
	healthRouter,
	rabbitRouter,
	s3Router,
	filelistRouter,
	submissionAgreementRouter,
	transferRouter,
} from "./modules";
import { protectedRoute } from "./modules/auth/middleware";
import type { Request, Response } from "express";
import multer from "multer";

const { ENVIRONMENT } = ENV;

// Define Express App
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors(CORS_OPTIONS));
app.use(rateLimit(RATE_LIMIT_OPTIONS));
app.use(cookieParser());
app.set("view engine", "ejs");
const upload = multer({ storage: multer.memoryStorage() });

// Add express utils middleware.
app.use(expressUtilitiesMiddleware);

// Disabled because it exposes information about the used framework to potential attackers.
app.disable("x-powered-by");

// Routing
healthModule(app); // Route (/health)
configModule(app, { ENVIRONMENT }); // Route (/config)

app.use("/filelist", protectedRoute(), filelistRouter);
app.use("/transfer", protectedRoute(), upload.single("file"), transferRouter);
app.use("/submission-agreement", protectedRoute(), submissionAgreementRouter);
app.use("/auth", authRouter);
app.use("/rabbit", rabbitRouter);
app.use("/s3", s3Router);
app.use("/ches", chesRouter);
app.use("/health", healthRouter); // Includes (/health/services)

app.use("/test", protectedRoute(["Admin"]), (req: Request, res: Response) => {
	res.json({ message: "YES" });
});

export default app;
