import mongoose from 'mongoose';
import logger from '../logs/winston-config';
import dotenv from 'dotenv';

dotenv.config();
/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    logger.info('Connecting to MongoDB... at ' + process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://dbuser:dbpass@localhost:27017/');
    console.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
