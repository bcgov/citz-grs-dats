import { ENV } from "@/config";
import {
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";

const { INTERNAL_BACKEND_URL } = ENV;

type Props = {
  token: string | undefined;
  standardTransferZipBuffer: Buffer;
  standardTransferZipChecksum: string;
  accession: string;
  application: string;
};

export const callTransferEndpoint = async ({
  token,
  standardTransferZipBuffer,
  standardTransferZipChecksum,
  accession,
  application,
}: Props) => {
  const endpoint = `${INTERNAL_BACKEND_URL}/transfer`;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Create form body
  const formData = new FormData();
  formData.append("file", new Blob([standardTransferZipBuffer]), "file.bin");
  formData.append("accession", accession);
  formData.append("application", application);
  formData.append("checksum", standardTransferZipChecksum);

  // Make request to /transfer
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response)
    throw new HttpError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred."
    );

  const { message, data, success } = await response.json();
  return { message, data, success };
};
