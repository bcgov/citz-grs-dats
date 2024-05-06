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
  const tokenSet = await client.callback(process.env.BASE_URL + '/callback', params);
  req.session.tokenSet = tokenSet;
  res.redirect('/'); 
}
