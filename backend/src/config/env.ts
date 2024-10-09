// Environment variables set in the .env file.
const {
	NODE_ENV,
	ENVIRONMENT,
	BACKEND_URL,
	BACKEND_PORT,
	MONGO_USER,
	MONGO_PASSWORD,
	MONGO_DATABASE_NAME,
	MONGO_HOST,
} = process.env;

// Exported configuration values.
export default {
	PORT: BACKEND_PORT ? Number(BACKEND_PORT) : 3200,
	NODE_VERSION: process.version,
	NODE_ENV,
	ENVIRONMENT,
	BACKEND_URL,
	MONGO_USER,
	MONGO_PASSWORD,
	MONGO_DATABASE_NAME,
	MONGO_HOST,
};
