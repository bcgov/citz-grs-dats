import { BaseClient, Issuer } from 'openid-client';
import { custom } from 'openid-client';
import logger from '../config/logs/winston-config';
import dotenv from 'dotenv';
dotenv.config();
// custom.setHttpOptionsDefaults({
//   timeout: parseInt(process.env.SSO_HTTP_TIMEOUT || "",10000),
// });

/**
 * Setup Keycloak client
 * @returns {Promise<BaseClient>} - Keycloak client
 */
export async function setupKeycloak(): Promise<BaseClient> {
  const issuer = `${process.env.SSO_ISSUER}/realms/${process.env.SSO_REALM}/.well-known/openid-configuration`;
  logger.info(`Setting up Keycloak client at ${issuer}`);
  const keycloakIssuer = await Issuer.discover(issuer);
  
  const client = new keycloakIssuer.Client({
    client_id: process.env.SSO_CLIENT_ID!,
    client_secret: process.env.SSO_CLIENT_SECRET!,
    redirect_uris: [`${process.env.BASE_URL!}/oidc/callback`],
    response_types: ['code'],
  });

  return client;
}
