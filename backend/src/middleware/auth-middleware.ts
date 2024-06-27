import logger from '../config/logs/winston-config';
import { verifyToken } from '../utils/jwt-utils';

export const authenticateJWT = (req: any, res: any, next: any) => {
  logger.info('Authenticating JWT');
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyToken(token);
      logger.debug(`JWT token is valid ${JSON.stringify(req.user)}`);
      next();
    } catch {
      logger.error('Invalid JWT token');
      res.sendStatus(403);
    }
  } else {
    logger.error('No authorization header');
    res.sendStatus(401);
  }
};