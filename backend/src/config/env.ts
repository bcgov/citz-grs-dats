// Environment variables set in the .env file.
const {
	NODE_ENV,
	ENVIRONMENT = "dev",
	BACKEND_URL,
	RABBITMQ_URL,
	BACKEND_PORT,
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
} = process.env;

const AUTH_URL = {
	dev: "https://dev.loginproxy.gov.bc.ca/auth",
	test: "https://test.loginproxy.gov.bc.ca/auth",
	prod: "https://loginproxy.gov.bc.ca/auth",
};

const CHES_TOKEN_ENDPOINT = `${AUTH_URL[CHES_ENVIRONMENT as "dev" | "test" | "prod"]}/realms/${CHES_REALM}/protocol/openid-connect/token`;

// Exported configuration values.
export default {
	PORT: BACKEND_PORT ? Number(BACKEND_PORT) : 3200,
	NODE_VERSION: process.version,
	NODE_ENV,
	ENVIRONMENT,
	BACKEND_URL,
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
};
