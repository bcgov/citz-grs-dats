import type amqp from "amqplib";
import { FileListService } from "../services";
import type { JsonFileList } from "../schemas";
import { createJsonFileList } from "./createJsonFileList";
import type { Workbook } from "exceljs";
import { createExcelWorkbook } from "./excel";
import { sendEmail } from "src/modules/ches/utils";
import { filelistEmail } from "./email";
import { formatDate, logs } from "src/utils";
import { FILELIST_QUEUE_NAME as QUEUE_NAME } from "@/modules/rabbit/utils/queue/filelist";

const {
  RABBITMQ: { JOB_PROCESSED },
  FILELIST: {
    CONSUMER: { FILELIST_NOT_FOUND, EMAIL_NOT_FOUND, INVALID_OUTPUT_FILETYPE },
  },
} = logs;

export const queueConsumer = async (
  msg: amqp.ConsumeMessage,
  channel: amqp.Channel
) => {
  const jobID = msg.content.toString();
  console.log(JOB_PROCESSED(QUEUE_NAME, jobID));

  // Get database record
  const filelist = await FileListService.getFileListByJobID(jobID);
  if (!filelist) {
    channel.ack(msg);
    return console.error(FILELIST_NOT_FOUND);
  }

  // Delete database record
  await FileListService.deleteFileListByJobID(jobID);

  // Format folder rows
  const folderRows = Object.entries(filelist.metadata.folders).map(
    ([folder, metadata]) => ({
      folder, // Add the key as the "folder" property
      ...metadata, // Spread the properties of the metadata
    })
  );

  // Format file rows
  const fileRows = Object.values(filelist.metadata.files).flat();

  const email = filelist.metadata.admin?.submittedBy?.email;
  if (!email) {
    channel.ack(msg);
    return console.error(EMAIL_NOT_FOUND);
  }

  const date = formatDate(new Date().toISOString());

  const accession = filelist.metadata.admin?.accession;
  const application = filelist.metadata.admin?.application;

  // Handle output file type
  switch (filelist.outputFileType) {
    case "excel": {
      const filename =
        accession && application
          ? `Digital_File_List_${accession}-${application}_${date}.xlsx`
          : `Digital_File_List_${date}.xlsx`;

      // Create Excel workbook
      const workbook: Workbook = createExcelWorkbook({
        folderRows,
        fileRows,
        accession: filelist.metadata?.admin?.accession,
        application: filelist.metadata?.admin?.application,
      });

      // Generate the Excel file as a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Convert the buffer to Base64 for email attachment
      const base64Buffer = Buffer.from(buffer).toString("base64");

      // Send filelist via email
      sendEmail({
        attachments: [
          {
            filename,
            content: base64Buffer,
            contentType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            encoding: "base64",
          },
        ],
        bodyType: "html",
        body: filelistEmail,
        to: [email],
        subject: "DATS - Digital File List Created",
      });

      return channel.ack(msg);
    }

    case "json": {
      const filename = `Digital_File_List_${date}.json`;

      // Create JSON file list
      const jsonFile: JsonFileList = createJsonFileList({
        accession: filelist.metadata?.admin?.accession,
        application: filelist.metadata?.admin?.application,
        folders: filelist.metadata.folders,
        files: filelist.metadata.files,
        extendedMetadata: filelist.extendedMetadata ?? {},
      });

      // Generate JSON string and buffer
      const jsonBuffer = Buffer.from(JSON.stringify(jsonFile, null, 2));

      // Send filelist via email
      sendEmail({
        attachments: [
          {
            filename,
            content: jsonBuffer.toString("base64"),
            contentType: "application/json",
            encoding: "base64",
          },
        ],
        bodyType: "html",
        body: filelistEmail,
        to: [email],
        subject: "DATS - File List",
      });

      return channel.ack(msg);
    }

    default: {
      channel.ack(msg);
      return console.error(INVALID_OUTPUT_FILETYPE);
    }
  }
};
