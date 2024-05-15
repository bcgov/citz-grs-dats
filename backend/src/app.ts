import express from "express";
import session from "express-session";
import { Response, Request, NextFunction } from "express";
import transferRouter from "./routes/transfer-route";
import digitalFileListRoute from "./routes/digital-file-list-route";
import digitalFileRoute from "./routes/digital-file-route";
import uploadFilesRoute from "./routes/upload-files-route";
import { specs, swaggerUi } from "./config/swagger/swagger-config";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";
import { authenticateJWT } from "./middleware/auth-middleware";
import * as sessionTypes from "./types/custom-types";
import logger from "./config/logs/winston-config";
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET!, // Change this to your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);


app.use(authRoutes);
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());



app.get("/" ,(req, res) => {
  res.send("hello world from HR management App Backend");
});

app.get('/dashboard', authenticateJWT, (req : any, res) => {
  logger.info('Dashboard route called');
  res.json({ message: 'This is a protected route', user: req.user });
});

app.use("/api", transferRouter);
app.use("/api", digitalFileListRoute);
app.use("/api", digitalFileRoute);
app.use("/api", uploadFilesRoute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(function (req: Request, res: Response, next: NextFunction) {
  console.log(
    `[${req.method} ${req.originalUrl}] is called, body is ${JSON.stringify(
      req.body
    )}`
  );
  next();
});

export default app;

