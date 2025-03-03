import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HttpError } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "src/config";

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_BUCKET } = ENV;

type GetDownloadUrlProps = {
  bucketName?: string;
  key: string;
  expiresIn?: number; // URL expiration time in seconds (default: 1 hour)
};

export const getDownloadUrl = async ({
  bucketName = S3_BUCKET,
  key,
  expiresIn = 3600,
}: GetDownloadUrlProps): Promise<string> => {
  if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_ENDPOINT) {
    throw new HttpError(
      400,
      "One or more of [S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT] env variables is undefined."
    );
  }

  const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: S3_ENDPOINT,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Important for some S3-compatible services
  });

  if (!bucketName || !key)
    throw new HttpError(400, "Bucket name and key are required.");

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // biome-ignore lint/suspicious/noExplicitAny:
    const url = await getSignedUrl(s3Client as any, command, { expiresIn });

    return url;
  } catch (error) {
    throw new HttpError(
      500,
      `Failed to generate download URL from S3. ${error}`
    );
  }
};
