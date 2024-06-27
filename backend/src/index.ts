import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/database/database';
import logger from './config/logs/winston-config';

dotenv.config();

logger.info('Starting server...');
logger.debug('configured debug log level');
// logger.debug(`Environment variables: ${JSON.stringify(process.env)}`);

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
    console.log('Adam is making changes');
  });
});
