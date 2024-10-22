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
	SSO_CLIENT_ID = "",
	SSO_CLIENT_SECRET = "",
} = process.env;

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
};
