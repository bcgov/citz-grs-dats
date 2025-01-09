import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { HttpError } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "src/config";
import { logs } from "src/utils";
import type { Readable } from "node:stream";

const {
  S3: { DOWNLOADED_SUCCESSFULLY },
} = logs;

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_BUCKET } = ENV;

type DownloadProps = {
  bucketName?: string;
  key: string;
};

export const download = async ({
  bucketName = S3_BUCKET,
  key,
}: DownloadProps): Promise<Readable> => {
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
    forcePathStyle: true, // Important
  });

  if (!bucketName || !key)
    throw new HttpError(400, "Bucket name and key are required.");

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body)
      throw new HttpError(
        404,
        `File not found in bucket: ${bucketName}, key: ${key}`
      );

    console.log(DOWNLOADED_SUCCESSFULLY(bucketName, key));
    return response.Body as Readable;
  } catch (error) {
    throw new HttpError(500, `Failed to download file from S3. ${error}`);
  }
};
