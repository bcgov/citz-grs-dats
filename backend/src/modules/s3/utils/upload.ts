import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { HttpError } from "@bcgov/citz-imb-express-utilities";
import { ENV } from "src/config";
import { logs } from "src/utils";
import { Readable } from "node:stream";

const {
  S3: { UPLOADED_SUCCESSFULLY },
} = logs;

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_BUCKET } = ENV;

type Props = {
  bucketName?: string;
  key: string;
  content: Buffer | Uint8Array | Blob | string | Readable;
};

export const upload = async ({
  bucketName = S3_BUCKET,
  key,
  content,
}: Props): Promise<string> => {
  if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_ENDPOINT)
    throw new HttpError(
      400,
      "One or more of [S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT] env variables is undefined."
    );

  const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: S3_ENDPOINT,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Important
  });

  if (!bucketName || !key || !content)
    throw new HttpError(400, "Bucket name, key, and content are required.");

  try {
    if (content instanceof Readable) {
      // Using @aws-sdk/lib-storage for Readable streams ensures efficient handling of large files or streams by leveraging multipart uploads.
      // Multipart uploads split the file into smaller parts, upload them in parallel, and reassemble them on the server side.
      // This reduces memory usage and speeds up the upload process, especially for large files or streaming data.
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: bucketName,
          Key: key,
          Body: content,
        },
      });

      await upload.done();
    } else {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: content,
      });

      await s3Client.send(command);
    }

    console.log(UPLOADED_SUCCESSFULLY(bucketName, key));
    return `${S3_ENDPOINT}/${bucketName}/${key}`;
  } catch (error) {
    throw new HttpError(500, `Failed to upload file to S3. ${error}`);
  }
};
