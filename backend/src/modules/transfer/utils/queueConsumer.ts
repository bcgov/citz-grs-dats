import { TRANSFER_QUEUE_NAME as QUEUE_NAME } from "src/modules/rabbit/utils/queue/transfer";
import type amqp from "amqplib";
import { TransferService } from "../services";
import {
  formatDate,
  streamToBuffer,
  logs,
  writeStreamToTempFile,
} from "src/utils";
import { download, upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { getFileFromZipStream } from "./getFileFromZipStream";
import { sendEmail } from "src/modules/ches/utils";
import { transferEmail } from "./email";
import { sortPSPContent } from "./sortPSPContent";
import type { TransferZod } from "../entities";
import { createPSP } from "./createPSP";
import { getFilenameByRegex } from "./getFilenameByRegex";
import { createFinalTransfer } from "./createFinalTransfer";
import { isChecksumValid } from "./isChecksumValid";
import type { Readable } from "node:stream";
import fs from "node:fs";
import { getBase64FromZipStream } from "./getBase64FromZipStream";

const {
  RABBITMQ: { JOB_PROCESSED },
  TRANSFER: {
    CONSUMER: {
      TRANSFER_NOT_FOUND,
      METADATA_NOT_FOUND,
      MISMATCH_CHECKSUM,
      EMAIL_NOT_FOUND,
      FILELIST_NOT_FOUND,
      SUB_AGREEMENT_NOT_FOUND,
      COMPLETED_TRANSFER,
    },
  },
} = logs;

const { S3_BUCKET } = ENV;

export const queueConsumer = async (
  msg: amqp.ConsumeMessage,
  channel: amqp.Channel
) => {
  const jobID = msg.content.toString();
  console.log(JOB_PROCESSED(QUEUE_NAME, jobID));

  // Get database record
  const transfer = await TransferService.getTransferWhere({ jobID: jobID });
  if (!transfer) {
    channel.ack(msg);
    return console.error(TRANSFER_NOT_FOUND(jobID));
  }

  if (!transfer.metadata) {
    channel.ack(msg);
    return console.error(METADATA_NOT_FOUND(jobID));
  }

  const metadata = JSON.parse(JSON.stringify(transfer.metadata));

  const accession = metadata.admin?.accession ?? "";
  const application = metadata.admin?.application ?? "";
  const date = formatDate(new Date().toISOString());

  const file_list_filename = `Digital_File_List_${accession}-${application}_${date}.xlsx`;
  const submission_agreement_filename = `Submission_Agreement_${accession}-${application}_${date}.pdf`;

  // Get transfer from s3
  const stream = await download({
    bucketName: S3_BUCKET,
    key: `transfers/TR_${accession}_${application}.zip`,
  });

  const tempContentStreamPath = await writeStreamToTempFile(stream);

  try {
    // Clone the content zip stream for validation
    const contentStream1 = fs.createReadStream(tempContentStreamPath);
    const contentStream2 = fs.createReadStream(tempContentStreamPath);
    const contentStream3 = fs.createReadStream(tempContentStreamPath);
    const contentStream4 = fs.createReadStream(tempContentStreamPath);
    const contentStream5 = fs.createReadStream(tempContentStreamPath);

    // Check to make sure record was not editted in s3
    if (
      !isChecksumValid({
        stream: contentStream1,
        checksum: transfer.checksum!,
      })
    ) {
      channel.ack(msg);
      return console.error(MISMATCH_CHECKSUM(accession, application));
    }

    // Process transfer
    const pspContent = sortPSPContent(
      metadata.folders as unknown as NonNullable<
        TransferZod["metadata"]
      >["folders"]
    );
    const pspStreams: {
      stream: Readable;
      schedule: string;
      classification: string;
    }[] = [];

    for (const psp of pspContent) {
      console.log(`Processing PSP: ${psp.schedule} - ${psp.classification}`);
      const contentStream = fs.createReadStream(tempContentStreamPath);
      const pspStream = await createPSP({
        folderContent: psp.content,
        stream: contentStream,
        metadata: metadata as unknown as {
          admin: NonNullable<TransferZod["metadata"]>["admin"];
          folders: NonNullable<TransferZod["metadata"]>["folders"];
          files: NonNullable<TransferZod["metadata"]>["files"];
        },
      });
      pspStreams.push({
        stream: pspStream,
        schedule: psp.schedule,
        classification: psp.classification,
      });
    }

    const newTransferStream = await createFinalTransfer(pspStreams);

    // Save to s3
    await upload({
      bucketName: S3_BUCKET,
      key: `transfers/TR_${accession}_${application}.zip`,
      content: newTransferStream,
    });

    // Get transfer files for email attachment
    const fileListPath = await getFilenameByRegex({
      stream: contentStream2,
      directory: "documentation/",
      regex: /^(digital_file_list|file\slist)/i,
    });

    const subAgreementPath = await getFilenameByRegex({
      stream: contentStream3,
      directory: "documentation/",
      regex: /^submission_agreement/i,
    });

    if (!fileListPath) {
      channel.ack(msg);
      return console.error(FILELIST_NOT_FOUND(accession, application));
    }

    if (!subAgreementPath) {
      channel.ack(msg);
      return console.error(SUB_AGREEMENT_NOT_FOUND(accession, application));
    }

    const fileListBase64 = await getBase64FromZipStream(
      contentStream4,
      fileListPath
    );
    const submissionAgreementBase64 = await getBase64FromZipStream(
      contentStream5,
      subAgreementPath
    );

    if (!fileListBase64) {
      channel.ack(msg);
      return console.error(FILELIST_NOT_FOUND(accession, application));
    }

    if (!submissionAgreementBase64) {
      channel.ack(msg);
      return console.error(SUB_AGREEMENT_NOT_FOUND(accession, application));
    }

    const email = metadata.admin?.submittedBy?.email;
    if (!email) {
      channel.ack(msg);
      return console.error(EMAIL_NOT_FOUND(accession, application));
    }

    const today = new Date().toISOString().split("T")[0].replaceAll("-", "/");

    // Save data for transfer to Mongo
    await TransferService.updateTransferEntry(accession, application, {
      jobID,
      status: "Transferred",
      transferDate: today,
    });

    // Send completion email
    sendEmail({
      attachments: [
        {
          filename: file_list_filename,
          content: fileListBase64,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          encoding: "base64",
        },
        {
          filename: submission_agreement_filename,
          content: submissionAgreementBase64,
          contentType: "application/pdf",
          encoding: "base64",
        },
      ],
      bodyType: "html",
      body: transferEmail(accession, application),
      to: [email],
      subject: "DATS - Records Sent to Digital Archives",
    });

    console.log(COMPLETED_TRANSFER(accession, application));
  } catch (error) {
  } finally {
    // Clean up the temporary file
    fs.unlink(tempContentStreamPath, (err) => {
      if (err) {
        console.error(
          `Failed to delete temp file: ${tempContentStreamPath}`,
          err
        );
      }
    });
  }

  // Acknowledge the message
  channel.ack(msg);
};
