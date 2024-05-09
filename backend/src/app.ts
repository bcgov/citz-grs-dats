import express from "express";
import session from "express-session";
import { Response, Request, NextFunction } from "express";
import { authenticate, handleCallback } from "./middleware/auth-middleware";
import transferRouter from "./routes/transfer-route";
import digitalFileListRoute from "./routes/digital-file-list-route";
import digitalFileRoute from "./routes/digital-file-route";
import uploadFilesRoute from "./routes/upload-files-route";
import { specs, swaggerUi } from "./config/swagger/swagger-config";
import cors from "cors";
import { login, logout } from "./controller/authController";

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'My-SuPeR-COoL-Secret-1234!@#$', // Change this to your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);
// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',  // Allow only http://localhost:3000 to access
  optionsSuccessStatus: 200         // For legacy browser support
};



app.get("/", authenticate ,(req, res) => {
  res.send("hello world from HR management App Backend");
});

// Authentication Routes
app.get('/login', login);
app.get('/callback', handleCallback);
app.post('/callback', handleCallback);
app.get('/protected', authenticate,(req, res) => { 
  res.send('Protected route');
});

app.use("/api", transferRouter);
app.use("/api", digitalFileListRoute);
app.use("/api", digitalFileRoute);
app.use("/api", authenticate ,uploadFilesRoute);

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

