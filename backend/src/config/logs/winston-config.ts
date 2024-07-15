import winston from 'winston';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const logDir = process.env.LOG_DIR || 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL!,
    format: winston.format.combine( 
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console({format: winston.format.combine(winston.format.colorize(), winston.format.simple())}),
        //new winston.transports.File({ filename: `${logDir}/app.log`, level: 'debug' }),
    ],
});

export default logger;
