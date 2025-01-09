import pdf from "pdf-parse";
import {
  HttpError,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";
import type { Buffer } from "node:buffer";

type Data = {
  buffer: Buffer;
  accession: string;
  application: string;
};

export const validateSubmissionAgreement = async ({
  buffer,
  accession,
  application,
}: Data): Promise<void> => {
  try {
    // Extract text from PDF
    const data = await pdf(buffer);

    const fullText = data.text; // Extracted text content
    const expectedAccessionApplicationText = `Accession # ${accession} and Application # ${application}`;

    // Validate the content for correct accession and application #s
    if (!fullText.includes(expectedAccessionApplicationText)) {
      throw new HttpError(
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Incorrect or missing accession and application numbers."
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Invalid PDF structure")) {
        throw new HttpError(
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid file: The provided buffer is not a valid PDF."
        );
      }

      throw new HttpError(
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        `An error occurred while validating the PDF: ${error.message}`
      );
    }

    throw new HttpError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "An unknown error occurred while validating the PDF."
    );
  }
};
