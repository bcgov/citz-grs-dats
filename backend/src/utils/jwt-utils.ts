import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.SSO_JWT_SECRET!;

export const generateTokens = (user: any) => {
    const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  };
  export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
  };