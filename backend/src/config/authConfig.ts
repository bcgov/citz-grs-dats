// keycloak.ts

import { Issuer, Client } from "openid-client";

// Discover the OIDC issuer and initialize the client
export async function initializeKeycloakClient(): Promise<{
  keycloakIssuer: Issuer;
  keycloakClient: Client;
}> {
  try {
    // Discover the OIDC issuer
    const keycloakIssuer = await Issuer.discover(
      `${process.env.SSO_AUTH_SERVER_URL}/realms/${process.env.SSO_REALM}/.well-known/openid-configuration`
    );

    // Initialize the client
    const keycloakClient = new keycloakIssuer.Client({
      client_id: process.env.SSO_CLIENT_ID || "",
      client_secret: process.env.SSO_CLIENT_SECRET,
      redirect_uris: ["http://localhost:5000/auth/callback"],
      response_types: ["code"],
    });

    return { keycloakIssuer, keycloakClient };
  } catch (error) {
    console.error("Error initializing Keycloak client:", error);
    throw error;
  }
}
