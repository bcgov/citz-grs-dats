import express from "express";
import cors from "cors";
import { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import * as routers from "./src/api/routes";
// import transferRouter from "./src/api/routes/transfer-route";
// import digitalFileListRouter from "./src/features/Transfer/routes/digitalFileList-route";
// import digitalFileRouter from "./src/features/Transfer/routes/digitalFile-route";
// import uploadFileRouter from "./src/features/Transfer/routes/uploadFiles-route";
import { swaggerDefinition } from "./swagger-definition";
import { datsComponents } from "./swagger-components";

dotenv.config(); // Load environment variables from .env
// Connect to MongoDB
const mongoUrl = process.env.MONGO_URI || "mongodb://localhost:27017/mydb";
const port = process.env.SERVER_PORT || 5000;
// (<any>mongoose).Promise = bluebird;

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("  MongoDB is connected successfully.");
  })
  .catch((err: any) => {
    console.error(
      "  MongoDB connection error. Please make sure MongoDB is running. " + err
    );
    process.exit();
  });
// Express configuration

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  // Include your components in the definition
  components: datsComponents,
  // components: {
  //   schemas: components, // Use the components from the separate file
  // },
  apis: ["src/features/*/controller/*-controller.ts"],
};

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = swaggerJSDoc(options);

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.set("server_port", port);
// app.set("origin_uri", ORIGIN_URI);
// app.use(compression());
app.use(cors());

// Use CORS middleware with custom options
// app.use(cors({
//     origin: 'http://localhost:3000', // Replace with your client's origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   }));

// app.use(cors({
//     origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void  => {
//         // allow requests with no origin
//         if (requestOrigin && CORS_WHITELIST.indexOf(requestOrigin) === -1) {
//             const message: string = "The CORS policy for this origin doesn't allow access from the particular origin.";
//             return callback(new Error(message), false);
//         } else {
//             // tslint:disable-next-line:no-null-keyword
//             return callback(null, true);
//         }
//     },
//     credentials: true
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(session({
//     resave: true,
//     saveUninitialized: true,
//     secret: SESSION_SECRET as string,
//     store: new MongoStore({
//         url: mongoUrl,
//         autoReconnect: true
//     })
// }));
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(lusca.xframe("SAMEORIGIN"));
// app.use(lusca.xssProtection(true));

// Mount the transferRouter as middleware
app.get("/", (req, res) => {
  res.send("hello world from HR management App Backend");
});
app.use("/api", routers.transferRouter);
app.use("/api", routers.digitalFileListRoute);
app.use("/api", routers.digitalFileRouter);
app.use("/api", routers.uploadFilesRouter);

// // Handle the file upload
// app.post('/upload', upload.single('file'), (req, res) => {
//   const file: IDigitalObject = req.file;

//   // You can now save the file to a backend folder using fs or any storage mechanism of your choice
//   // For example:
//   fs.writeFileSync(`backend-folder/${file.originalname}`, file.buffer);

app.use(function (req: Request, res: Response, next: NextFunction) {
  console.log(
    `[${req.method} ${req.originalUrl}] is called, body is ${JSON.stringify(
      req.body
    )}`
  );
  next();
});

// Server rendering configuration
// if (process.env.NODE_ENV === "production") {
//     app.use(
//         express.static("./client/core/build", { maxAge: 31557600000 })
//     );
//     app.use((req: Request, res: Response, next: NextFunction) => {
//         if (req.originalUrl.startsWith("/api") ||
//             req.originalUrl.startsWith("/auth") ||
//             req.originalUrl.startsWith("/oauth2")) {
//             next();
//         } else {
//             const options = {
//                 root: "./client/core/build/",
//                 dotfiles: "deny",
//                 headers: {
//                     "x-timestamp": Date.now(),
//                     "x-sent": true
//                 }
//             };

//             const fileName = "index.html";
//             res.sendFile(fileName, options, function (err) {
//                 if (err) {
//                     next(err);
//                 } else {
//                     console.log("Sent:", fileName);
//                 }
//             });
//         }
//     });
// }

export default app;
