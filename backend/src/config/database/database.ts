import mongoose from 'mongoose';
import logger from '../logs/winston-config';
import dotenv from 'dotenv';

dotenv.config();
/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://dbuser:dbpass@localhost:27017/');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
