// Environment variables set in the .env file.
const {
  NODE_ENV,
  ENVIRONMENT = "dev",
  BACKEND_URL,
  RABBITMQ_URL,
  BACKEND_PORT,
  INTERNAL_BACKEND_URL = "http://express-api:3200",
  MONGO_USER = "admin",
  MONGO_PASSWORD = "password",
  MONGO_DATABASE_NAME = "dats",
  MONGO_HOST = "mongo",
  SSO_ENVIRONMENT = "dev",
  SSO_REALM = "standard",
  SSO_PROTOCOL = "openid-connect",
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT = "https://citz-grs-dats.objectstore.gov.bc.ca",
  S3_BUCKET = "dats-bucket-dev",
  CHES_CLIENT_ID,
  CHES_CLIENT_SECRET,
  CHES_REALM = "comsvcauth",
  CHES_ENVIRONMENT = "dev",
  CHES_URL = "https://ches-dev.api.gov.bc.ca/api/v1",
  LIBSAFE_API_URL = "https://ls.pre.bcmcz.libnova.com/api",
  LIBSAFE_API_KEY,
  LIBSAFE_ARCHIVAL_STRUCTURE_ID = "79",
  LIBSAFE_STORAGE_ID = "1",
  LIBSAFE_WORKFLOW_ID = "4",
  LIBSAFE_CONTAINER_METADATA_ID = "12",
  LIBSAFE_METADATA_SCHEMA_ID = "10",
  SAVE_TO_LIBSAFE = "false",
} = process.env;

const AUTH_URL = {
  dev: "https://dev.loginproxy.gov.bc.ca/auth",
  test: "https://test.loginproxy.gov.bc.ca/auth",
  prod: "https://loginproxy.gov.bc.ca/auth",
};

const CHES_TOKEN_ENDPOINT = `${
  AUTH_URL[CHES_ENVIRONMENT as "dev" | "test" | "prod"]
}/realms/${CHES_REALM}/protocol/openid-connect/token`;

// Exported configuration values.
export default {
  PORT: BACKEND_PORT ? Number(BACKEND_PORT) : 3200,
  NODE_VERSION: process.version,
  NODE_ENV,
  ENVIRONMENT,
  BACKEND_URL,
  INTERNAL_BACKEND_URL,
  RABBITMQ_URL,
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_DATABASE_NAME,
  MONGO_HOST,
  SSO_ENVIRONMENT,
  SSO_REALM,
  SSO_PROTOCOL,
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT,
  S3_BUCKET,
  CHES_CLIENT_ID,
  CHES_CLIENT_SECRET,
  CHES_TOKEN_ENDPOINT,
  CHES_URL,
  LIBSAFE_API_URL,
  LIBSAFE_API_KEY,
  LIBSAFE_ARCHIVAL_STRUCTURE_ID: Number(LIBSAFE_ARCHIVAL_STRUCTURE_ID),
  LIBSAFE_STORAGE_ID: Number(LIBSAFE_STORAGE_ID),
  LIBSAFE_WORKFLOW_ID: Number(LIBSAFE_WORKFLOW_ID),
  LIBSAFE_CONTAINER_METADATA_ID: Number(LIBSAFE_CONTAINER_METADATA_ID),
  LIBSAFE_METADATA_SCHEMA_ID: Number(LIBSAFE_METADATA_SCHEMA_ID),
  SAVE_TO_LIBSAFE: SAVE_TO_LIBSAFE === "true",
};
