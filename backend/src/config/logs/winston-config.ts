import winston from "winston";
import { MongoDB } from "winston-mongodb";
import fs from "fs";
import dotenv from "dotenv";
import connectDB from "../database/database";
dotenv.config();

const logDir = process.env.LOG_DIR || "logs";
const logLevel = process.env.LOG_LEVEL || "debug";

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

if (logLevel === "audit") {
  console.error(
    "The loglevel cannot be set to AUDIT. AUDIT level is only logging audit logs to db"
  );
  process.exit(1);
}
// Define custom log levels
const customLevels = {
  levels: {
    audit: -1,
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  colors: {
    audit: "orange",
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    verbose: "cyan",
    debug: "blue",
    silly: "grey",
  },
};

const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      level: logLevel,
      format: winston.format.combine(winston.format.simple()),
      handleExceptions: true,
    }),
    new winston.transports.File({
      level: logLevel,
      filename: `${logDir}/app.log`,
      handleExceptions: true,
    }),
    // MongoDB transport for 'audit' log level
    new MongoDB({
      level: "audit", // Will log only 'audit' level
      db: process.env.MONGODB_URI || "mongodb://dbuser:dbpass@localhost:27017/",
      metaKey: "metadata",
      options: {
        useUnifiedTopology: true,
      },
      collection: "audit_logs",
      format: winston.format.combine(
        winston.format.metadata(),
        winston.format.json()
      ),
    }),
  ],
});

// Auditor function
export const auditor = (message: string, meta: object) => {
  logger.log("audit", message, meta);
};

// Add colors to custom log levels
winston.addColors(customLevels.colors);
export default logger;
