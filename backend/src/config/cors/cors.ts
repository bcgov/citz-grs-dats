import env from './env';
const { FRONTEND_URL } = env;

/**
 * Middleware for enabling Cross-Origin Resource Sharing (CORS) on the server.
 * @module cors
 * @property {string|string[]} origin - The allowed origins for CORS requests.
 * @property {boolean} credentials - Whether to allow credentials to be included in CORS requests.
 */
export const CORS_OPTIONS = {
  origin: FRONTEND_URL,
  credentials: true,
};
