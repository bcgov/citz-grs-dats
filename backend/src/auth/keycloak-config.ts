import { BaseClient, Issuer } from 'openid-client';
import dotenv from 'dotenv';

dotenv.config();
/**
 * Setup Keycloak client
 * @returns {Promise<BaseClient>} - Keycloak client
 */
export async function setupKeycloak(): Promise<BaseClient> {
  //console.log('KEYCLOAK_URL', process.env.KEYCLOAK_URL);
  const keycloakIssuer = await Issuer.discover(`${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/.well-known/openid-configuration`);
  //console.log('keycloakIssuer', keycloakIssuer);
  const client = new keycloakIssuer.Client({
    client_id: process.env.KEYCLOAK_CLIENT_ID || 'dats-5158',
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET || 'jUGWQRsxYQ4YQml50NdEXie2M0Mj8jxQ',
    redirect_uris: ['http://localhost:5000/callback'],
    post_logout_redirect_uris: ['http://localhost:3000/'],
    response_types: ['code'],
  });

  return client;
}
