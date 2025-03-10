import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { preserveTransferBodySchema } from "../schemas";
import { ENV } from "@/config";
import { TransferService } from "../services";
import { download } from "@/modules/s3/utils";
import { streamToBuffer, logs } from "@/utils";

const {
  LIBSAFE_API_URL,
  LIBSAFE_API_KEY,
  LIBSAFE_ARCHIVAL_STRUCTURE_ID,
  LIBSAFE_STORAGE_ID,
  LIBSAFE_WORKFLOW_ID,
  LIBSAFE_CONTAINER_METADATA_ID,
  LIBSAFE_METADATA_SCHEMA_ID,
  SAVE_TO_LIBSAFE,
  S3_BUCKET,
} = ENV;

const {
  LIBSAFE: { CREATE_CONTAINER, CONTAINER_UPLOAD },
} = logs;

// Preserve a transfer to Libsafe.
export const preserve = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user } = req;
  const body = getZodValidatedBody(preserveTransferBodySchema); // Validate request body

  if (!LIBSAFE_API_KEY)
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Missing LIBSAFE_API_KEY env var."
    );

  let containerDetails = {};

  if (SAVE_TO_LIBSAFE) {
    const containerEndpoint = `${LIBSAFE_API_URL}/container`;

    const headers = {
      Authorization: `Bearer ${LIBSAFE_API_KEY}`,
    };

    // Make request to LIBSAFE, create container
    const containerResponse = await fetch(containerEndpoint, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        archival_structure_id: LIBSAFE_ARCHIVAL_STRUCTURE_ID,
        auto_check_in: true,
        container_metadata_id: LIBSAFE_CONTAINER_METADATA_ID,
        metadata_schema_id: LIBSAFE_METADATA_SCHEMA_ID,
        name: `TR_${body.accession}_${body.application}`,
        quota: "DISABLED",
        storage_id: LIBSAFE_STORAGE_ID,
        workflow_id: LIBSAFE_WORKFLOW_ID,
      }),
    });

    if (!containerResponse)
      throw new HttpError(
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred."
      );

    const containerJsonResponse = await containerResponse.json();

    if (!containerJsonResponse.success)
      throw new HttpError(
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        "The LibSafe create container request failed."
      );

    containerDetails = containerJsonResponse.result;

    console.log(CREATE_CONTAINER(containerJsonResponse.result.id));

    const containerUploadEndpoint = `${LIBSAFE_API_URL}/container/${containerJsonResponse.result.id}/file/upload`;

    // Get transfer from s3
    const stream = await download({
      bucketName: S3_BUCKET,
      key: `transfers/TR_${body.accession}_${body.application}.zip`,
    });
    const buffer = await streamToBuffer(stream);
    const chunkSize = 1024 * 1024 * 1024; // 1GB
    const chunkCount = Math.ceil(buffer.length / chunkSize);

    for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, buffer.length);
      const fileChunk = buffer.slice(start, end);

      const transferFilename = `TR_${body.accession}_${body.application}.zip`;

      // Create FormData for this chunk
      const formData = new FormData();
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("chunkCount", chunkCount.toString());
      formData.append("file", new Blob([fileChunk]), transferFilename);
      formData.append("fileName", transferFilename);

      // Make request to LIBSAFE, upload to container
      const response = await fetch(containerUploadEndpoint, {
        method: "POST",
        headers: { ...headers, "Content-Type": "multipart/form-data" },
        body: formData,
      });

      if (!response.ok) {
        console.error(`Chunk ${chunkIndex + 1} failed:`, await response.text());
        throw new Error(`Failed to upload chunk ${chunkIndex + 1}`);
      }

      console.log(
        CONTAINER_UPLOAD(
          containerJsonResponse.result.id,
          transferFilename,
          chunkIndex + 1,
          chunkCount
        )
      );
    }
  }

  // Get existing transfer metadata
  const transferEntry = await TransferService.getTransferWhere({
    "metadata.admin.accession": body.accession,
    "metadata.admin.application": body.application,
  });

  const newStatus =
    transferEntry?.status === "Downloaded"
      ? "Downloaded & Preserved"
      : "Preserved";

  // Update mongo record
  await TransferService.updateTransferEntry(body.accession, body.application, {
    status: newStatus,
  });

  const result = getStandardResponse({
    data: {
      user: `${user?.first_name} ${user?.last_name}`,
      accession: body.accession,
      application: body.application,
      container: containerDetails,
    },
    message: SAVE_TO_LIBSAFE
      ? "Preserved to LibSafe."
      : "Preserved. You are not in the production environment so the transfer was not actually preserved to LibSafe.",
    success: true,
  });

  res.status(HTTP_STATUS_CODES.OK).json(result);
});
