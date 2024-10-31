import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { HttpError } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "src/config";

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT } = ENV;

export const checkS3Connection = async (): Promise<boolean> => {
	if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_ENDPOINT)
		throw new HttpError(
			400,
			"One or more of [S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT] env variables is undefined.",
		);

	const s3Client = new S3Client({
		region: "us-east-1",
		endpoint: S3_ENDPOINT,
		credentials: {
			accessKeyId: S3_ACCESS_KEY_ID,
			secretAccessKey: S3_SECRET_ACCESS_KEY,
		},
	});

	try {
		// Test connection by listing buckets
		await s3Client.send(new ListBucketsCommand({}));
		return true;
	} catch (error) {
		console.error("S3 connection error:", error);
		throw error;
	}
};
