/* eslint-disable no-console */
import { KCOptions, KeycloakUser } from "@bcgov/citz-imb-kc-express";
import { activateUser } from "../utils/activateUser";

const { DEBUG } = process.env;

// Keycloak auth integration configuration.
const KEYCLOAK_OPTIONS = {
  afterUserLogin: (user: KeycloakUser) => {
    if (DEBUG)
      console.log("DEBUG: afterUserLogin in config KEYCLOAK_OPTIONS called.");
    activateUser(user);
  },
  afterUserLogout: (user: KeycloakUser) => {
    if (DEBUG)
      console.log("DEBUG: afterUserLogout in config KEYCLOAK_OPTIONS called.");
    console.log(`${user?.display_name ?? "Unknown"} has logged out.`);
  },
} as KCOptions;

export default KEYCLOAK_OPTIONS;
