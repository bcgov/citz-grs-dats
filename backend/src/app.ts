import express from "express";
import session from "express-session";
import { Response, Request, NextFunction } from "express";
import transferRouter from "./routes/transfer-route";
import digitalFileListRoute from "./routes/digital-file-list-route";
import digitalFileRoute from "./routes/digital-file-route";
import uploadFilesRoute from "./routes/upload-files-route";
import S3ClientService from "./service/s3Client-service";
import TransferService from "./service/transfer-service";
import { specs, swaggerUi } from "./config/swagger/swagger-config";
import cors from "cors";
import bodyParser from "body-parser";
import * as sessionTypes from "./types/custom-types";
import logger, { auditor } from "./config/logs/winston-config";
import cookieParser from "cookie-parser";
import path from "path";
import crypto from 'crypto';
import fs from 'fs';
import multer from "multer";
import { protectedRoute, sso } from '@bcgov/citz-imb-sso-express';

import { ITransfer } from "./models/interfaces/ITransfer";
import connectDB from "./config/database/database";
const app = express();
sso(app);

logger.info('This is an info message');
  logger.error('This is an error message');
  auditor('test audit log', { event: 'user_login', username: 'johndoe' }); 


const corsOptions = {
  origin: process.env.CLIENT_BASE_URL, // 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);


// app.use(authRoutes);
app.use(express.json());


// Healt check 
app.get("/", (req, res) => {
  res.status(200).json("API Is Healthy");
});

app.get('/dashboard', protectedRoute(), (req: any, res) => {
  logger.info('Dashboard route called');
  res.json({ message: 'This is a protected route', user: req.user });
});
app.get('/api/base-url', (req, res) => {
  res.json({ baseUrl: `${process.env.BACKEND_URL}` });
});
app.use("/api", transferRouter);
app.use("/api", digitalFileListRoute);
app.use("/api", digitalFileRoute);
app.use("/api", uploadFilesRoute);

// app.get('/userinfo', authenticateJWT, (req: any, res) => {
//   logger.info('Userinfo route called');
//   res.json(req.user.userinfo);
// });
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(function (req: Request, res: Response, next: NextFunction) {
  console.log(
    `[${req.method} ${req.originalUrl}] is called, body is ${JSON.stringify(
      req.body
    )}`
  );
  next();
});

// Set up multer storage and file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/upload-files', upload.single('file'), (req, res) => {
  console.log('req received to upload');
  const file = req.file;
  //do NOT the req params names as this has to match with the ones in windows service
  const receivedChecksum = req.body.checksum;
  const transferId = req.body.transferId;
  const applicationNumber = req.body.applicationNumber;
  const accessionNumber = req.body.accessNumber;
  const primarySecondary = req.body.classification;
  const techMetadata = req.body.technicalV2;
  //folderPath  validation
  if (!file || !receivedChecksum || !applicationNumber || !accessionNumber || !primarySecondary) {
    return res.status(400).send('File, checksum, transferId, applicationNumber, accessionNumber or  classification missing');
  }
console.log('no validation issues');
  // Calculate the SHA-1 checksum of the uploaded file
  const hash = crypto.createHash('sha1');
  hash.update(file.buffer);
  const calculatedChecksum = hash.digest('hex');

  // Compare checksums
  if (calculatedChecksum === receivedChecksum) {
    var obj = `{
        "code" : "shah1",
        "checksume" : receivedChecksum,
      }`;

    //convert object to json string
    var checksumString = JSON.stringify(obj);
    const s3ClientService = new S3ClientService();
    console.log('uploading to s3 - started');
    const zipFilePath = s3ClientService.uploadZipFile(file, applicationNumber, accessionNumber, primarySecondary, checksumString);
    console.log('uploading to s3 - done');

    console.log('all good');
    res.status(200).send('File uploaded and checksum verified');

  } else {
    // Handle checksum mismatch
    console.log('checksum mismatch');
    const transferService = new TransferService();
    transferService.deleteTransfer(transferId)
    res.status(400).send('Checksum mismatch');
  }
});

export default app;

