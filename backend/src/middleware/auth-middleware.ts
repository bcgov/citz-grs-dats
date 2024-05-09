import { Request, Response, NextFunction } from 'express';
import { setupKeycloak } from '../auth/keycloak-config';
import * as sessionTypes from '../types/custom-types'
let client;

(async () => {
  client = await setupKeycloak();
})();

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  if (!req.session.tokenSet) {
    const authUrl = client.authorizationUrl({ scope: 'openid profile email' });
    res.redirect(authUrl);
  } else {
    next();
  }
}

export async function handleCallback(req: Request, res: Response) {
  const params = client.callbackParams(req);
  console.log('params', params);
  const tokenSet = await client.callback(process.env.BASE_URL + '/callback', params, {
        state: req.query.state
    }); 
  
  console.log('tokenSet', tokenSet);
  req.session.tokenSet = tokenSet;
  res.redirect(`http://localhost:3000/tokenReceived?access_token=${tokenSet.access_token}`);
}
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  
  if (!req.headers.authorization) {
      return res.status(401).send('Authorization header missing');
  }
  try {
      const accessToken = req.headers.authorization.split(' ')[1];
      const userinfo = await client.userinfo(accessToken);
      req.user = userinfo;  // Attach user info to the request
      next();
  } catch (error) {
      return res.status(401).send('Invalid or expired token');
  }
};