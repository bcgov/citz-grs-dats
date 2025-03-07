import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { HttpError } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "src/config";
import { logs } from "src/utils";

const {
  S3: { DELETED_SUCCESSFULLY },
} = logs;

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_BUCKET } = ENV;

type DeleteProps = {
  bucketName?: string;
  key: string;
};

export const deleteFile = async ({
  bucketName = S3_BUCKET,
  key,
}: DeleteProps): Promise<void> => {
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

  if (!bucketName || !key) {
    throw new HttpError(400, "Bucket name and key are required.");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    console.log(DELETED_SUCCESSFULLY(bucketName, key));
  } catch (error) {
    throw new HttpError(500, `Failed to delete file from S3. ${error}`);
  }
};
