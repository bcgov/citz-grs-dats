import { ANSI_CODES } from "@bcgov/citz-imb-express-utilities";

const LIME = ANSI_CODES.FOREGROUND.LIME;
const AQUA = ANSI_CODES.FOREGROUND.AQUA;
const MAGENTA = ANSI_CODES.FOREGROUND.MAGENTA;
const LIGHT_BLUE = ANSI_CODES.FOREGROUND.LIGHT_BLUE;
const RED = ANSI_CODES.FOREGROUND.RED;
const PINK = ANSI_CODES.FOREGROUND.PINK;

const RESET = ANSI_CODES.FORMATTING.RESET;

export const DATABASE = {
  CONNECTION_SUCCESS: `${LIME}Database connection and initialization successful.${RESET}`,
  CONNECTION_ERROR: `${PINK}[ERROR] ${RESET}${RED}Connecting to the database:${RESET}`,
};

export const RABBITMQ = {
  CONNECTION_SUCCESS: `${LIME}RabbitMQ connection established for queue${RESET}`,
  CONNECTION_ERROR: `${PINK}[ERROR] ${RESET}${RED}Failed to connect to RabbitMQ:${RESET}`,
  JOB_PROCESSED: (QUEUE_NAME: string, jobID: string) =>
    `${AQUA}[${QUEUE_NAME}]${RESET} Processed job: ${jobID}`,
  CHANNEL_CREATED_QUEUE_ASSERTED: (QUEUE_NAME: string) =>
    `${AQUA}[${QUEUE_NAME}]${RESET} Channel created and queue asserted.`,
  CHANNEL_CLOSED: (QUEUE_NAME: string) =>
    `${AQUA}[${QUEUE_NAME}]${RESET} RabbitMQ channel closed.`,
  CONNECTION_CLOSED: "RabbitMQ connection closed.",
  FAILED_TO_CLOSE_CONNECTION: "Failed to close RabbitMQ connection:",
  STARTING_CONSUMER: (QUEUE_NAME: string) =>
    `${AQUA}[${QUEUE_NAME}]${RESET} Starting queue consumer...`,
  STARTED_CONSUMER: (QUEUE_NAME: string) =>
    `${AQUA}[${QUEUE_NAME}]${RESET} Queue consumer started.`,
  FAILED_TO_CONSUME_MESSAGES: (QUEUE_NAME: string) =>
    `${AQUA}[${QUEUE_NAME}]${RESET} Failed to consume messages from RabbitMQ:`,
};

export const S3 = {
  UPLOADED_SUCCESSFULLY: (bucketName: string, key: string) =>
    `${MAGENTA}[S3]${RESET} File uploaded successfully to bucket: ${bucketName}, key: ${key}`,
  DOWNLOADED_SUCCESSFULLY: (bucketName: string, key: string) =>
    `${MAGENTA}[S3]${RESET} File downloaded successfully from bucket: ${bucketName}, key: ${key}`,
};

export const FILELIST = {
  CONSUMER: {
    FILELIST_NOT_FOUND: `${LIGHT_BLUE}[File List Consumer]${RESET} ${RED}Filelist not found in queueConsumer.${RESET}`,
    EMAIL_NOT_FOUND: `${LIGHT_BLUE}[File List Consumer]${RESET} ${RED}Email not found in filelist admin metadata.${RESET}`,
    INVALID_OUTPUT_FILETYPE: `${LIGHT_BLUE}[File List Consumer]${RESET} ${RED}Invalid output file type.${RESET}`,
  },
  SERVICE: {
    ERROR_CREATING_ENTRY: `${MAGENTA}[File List Service]${RESET} ${RED}Error creating FileList entry:${RESET}`,
    ERROR_DELETING_ENTRY: `${MAGENTA}[File List Service]${RESET} ${RED}Error deleting FileList entry:${RESET}`,
    ERROR_RETRIEVING_ENTRY_BY_JOBID: (jobID: string) =>
      `${MAGENTA}[File List Service]${RESET} ${RED}Error retrieving FileList entry by jobID ${jobID}:${RESET}`,
  },
};

export const TRANSFER = {
  CONSUMER: {
    TRANSFER_NOT_FOUND: `${LIGHT_BLUE}[Transfer Consumer]${RESET} ${RED}Transfer not found in queueConsumer.${RESET}`,
    METADATA_NOT_FOUND: `${LIGHT_BLUE}[Transfer Consumer]${RESET} ${RED}Transfer metadata not found in queueConsumer.${RESET}`,
    MISMATCH_CHECKSUM: `${LIGHT_BLUE}[Transfer Consumer]${RESET} ${RED}Checksum of buffer and transfer.checksum do not match in queueConsumer.${RESET}`,
    EMAIL_NOT_FOUND: `${LIGHT_BLUE}[Transfer Consumer]${RESET} ${RED}Email not found in transfer admin metadata.${RESET}`,
    FILELIST_NOT_FOUND: `${LIGHT_BLUE}[Transfer Consumer]${RESET} ${RED}Couldn't find Digital File List in documentation/.${RESET}`,
    SUB_AGREEMENT_NOT_FOUND: `${LIGHT_BLUE}[Transfer Consumer]${RESET} ${RED}Couldn't find Submission Agreement in documentation/.${RESET}`,
    COMPLETED_TRANSFER: (accession: string, application: string) =>
      `${LIGHT_BLUE}[Transfer Consumer]${RESET} Completed transfer of TR_${accession}_${application}`,
  },
  CONTROLLER: {
    SUB_AGREEMENT_NOT_FOUND: (accession: string, application: string) =>
      `${LIGHT_BLUE}[POST /transfer]${RESET} ${RED}No Submission Agreement was found in the transfer files for TR_${accession}_${application}.${RESET}`,
    USING_S3_SUB_AGREEMENT: (accession: string, application: string) =>
      `${LIGHT_BLUE}[POST /transfer]${RESET} ${RED}Using Submission Agreement found in s3 for TR_${accession}_${application}.${RESET}`,
  },
  SERVICE: {
    ERROR_CREATING_ENTRY: `${MAGENTA}[Transfer Service]${RESET} ${RED}Error creating Transfer entry:${RESET}`,
    ERROR_CREATING_OR_UPDATING_ENTRY: `${MAGENTA}[Transfer Service]${RESET} ${RED}Error creating or updating Transfer entry:${RESET}`,
    ERROR_UPDATING_ENTRY: `${MAGENTA}[Transfer Service]${RESET} ${RED}Error updating Transfer entry:${RESET}`,
    ERROR_IN_GET_TRANSFER_WHERE: `${MAGENTA}[Transfer Service]${RESET} ${RED}Error in getTransferWhere:${RESET}`,
  },
};
