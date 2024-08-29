import express from "express";
import { Response, Request, NextFunction } from "express";
import transferRouter from "./routes/transfer-route";
import digitalFileListRoute from "./routes/digital-file-list-route";
import uploadFilesRoute from "./routes/upload-files-route";
import { specs, swaggerUi } from "./config/swagger/swagger-config";
import cors from "cors";
import bodyParser from "body-parser";
import logger, { auditor } from "./config/logs/winston-config";
import cookieParser from "cookie-parser";
import path from "path";
import { protectedRoute, sso } from "@bcgov/citz-imb-sso-express";
import { sftpHealthCheck } from "./config/ssh2-sftp-client";
const app = express();

app.set("trust proxy", 1);

sso(app);

logger.info("This is an info message");
logger.debug("This is an debug message");
logger.error("This is an error message");
auditor("test audit log", { event: "user_login", username: "johndoe" });

const corsOptions = {
  origin: process.env.FRONTEND_URL, // 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json("API Is Healthy");
});

// SFTP Health check connection to LAnd drive
app.get("/SFTPCheck", async (req, res) => {
  try {
    // Perform the SFTP health check
    await sftpHealthCheck();

    res.status(200).json("SFTP health check completed successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.error("SFTP health check failed:", error.message);
      res.status(503).json("SFTP health check failed: " + error.message);
    } else {
      console.error("SFTP health check failed with an unknown error");
      res.status(503).json("SFTP health check failed with an unknown error");
    }
  }
});

app.get("/api/base-url", (req, res) => {
  res.json({ baseUrl: `${process.env.BACKEND_URL}` });
});
app.use("/api", transferRouter);
app.use("/api", digitalFileListRoute);
app.use("/api", uploadFilesRoute);

// app.get('/userinfo', authenticateJWT, (req: any, res) => {
//   logger.info('Userinfo route called');
//   res.json(req.user.userinfo);
// });
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(function (req: Request, res: Response, next: NextFunction) {
  console.log(
    `[${req.method} ${req.originalUrl}] is called, body is ${JSON.stringify(
      req.body
    )}`
  );
  next();
});

export default app;
