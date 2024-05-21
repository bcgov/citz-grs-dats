import { Router } from 'express';
import { setupKeycloak } from '../auth/keycloak-config';
import { BaseClient, generators } from 'openid-client';
import { generateTokens, verifyToken } from '../utils/jwt-utils';
import * as sessionTypes from '../types/custom-types' 
import logger from '../config/logs/winston-config';
const router = Router();

let client: any;

(async () => {
  client = await setupKeycloak();
})();

router.get('/login', (req, res) => {
  const state = generators.state();
  const nonce = generators.nonce();
  const returnUrl = req.query.returnUrl || process.env.CLIENT_BASE_URL!;
  req.session.state = state;
  req.session.nonce = nonce;
  req.session.returnUrl = returnUrl;
  const authUrl = client.authorizationUrl({
    scope: 'openid profile email',
    response_type: 'code',
    state,
    nonce,
    'kc_idp_hint': 'idir',
  });
  logger.info(`/login route called, redirecting to ${authUrl}`);

  res.redirect(authUrl);
});

router.get('/oidc/callback', async (req, res) => {
  logger.info(`/oidc/callback route called`);
  const params = client.callbackParams(req);
  const tokenSet = await client.callback(`${process.env.BASE_URL}/oidc/callback`, params, {
    state: req.session.state,
    nonce: req.session.nonce,
  });
  const userinfo = await client.userinfo(tokenSet.access_token);
  const tokens = generateTokens({ userinfo });
logger.debug(`Token set: ${JSON.stringify(tokens)}`);
  const returnUrl = req.session.returnUrl || process.env.CLIENT_BASE_URL!;
  res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
  res.redirect(returnUrl); // Redirect to frontend dashboard after successful login
});

router.post('/refresh-token', (req, res) => {
  logger.info(`/refresh-token route called`);
  const refreshToken = req.cookies['refreshToken'];
  if (!refreshToken) return res.sendStatus(403);

  try {
    const user = verifyToken(refreshToken);
    const tokens = generateTokens(user);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
    res.json({ accessToken: tokens.accessToken });
  } catch(e){
    logger.error(`Error refreshing token: ${e}`);
    res.sendStatus(403);
  }
});

router.get('/logout', (req, res) => {
  const postLogoutRedirectUri = 'http://localhost:3000/';
  const ssoLogoutUrlWithRedirect = `${client.endSessionUrl()}?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
  logger.info(`/logout route called, redirecting to ${ssoLogoutUrlWithRedirect}`);
  res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
  res.redirect(ssoLogoutUrlWithRedirect); // Redirect to SSO provider's logout endpoint with post-logout redirect URI
});

export default router;
