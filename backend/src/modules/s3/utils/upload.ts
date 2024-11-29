import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { HttpError } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "src/config";
import type { Readable } from "node:stream";

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT } = ENV;

type Props = {
	bucketName: string;
	key: string;
	content: Buffer | Uint8Array | Blob | string | Readable;
	contentType: string;
};

export const upload = async ({
	bucketName,
	key,
	content,
	contentType = "application/octet-stream",
}: Props): Promise<string> => {
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

	if (!bucketName || !key || !content)
		throw new HttpError(400, "Bucket name, key, and content are required.");

	try {
		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: key,
			Body: content,
			ContentType: contentType,
		});

		await s3Client.send(command);

		console.log(`File uploaded successfully to bucket: ${bucketName}, key: ${key}`);
		return `${S3_ENDPOINT}/${bucketName}/${key}`;
	} catch (error) {
		throw new HttpError(500, "Failed to upload file to S3.");
	}
};
