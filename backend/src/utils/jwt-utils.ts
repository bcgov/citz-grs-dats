import jwt from 'jsonwebtoken';
import logger from '../config/logs/winston-config';
const JWT_SECRET = process.env.SSO_JWT_SECRET!;

export const generateTokens = (user: any) => {
  const accessToken = jwt.sign({ userinfo: user.userinfo }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userinfo: user.userinfo }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
  };
  export const verifyToken = (token: string) => {
    var res  = jwt.verify(token, JWT_SECRET);
    logger.debug(`Token verified: ${JSON.stringify(res)}`);
    return res;
  };