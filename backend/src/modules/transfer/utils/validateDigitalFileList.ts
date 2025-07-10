import {
  HttpError,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";
import xlsx from "xlsx";
import type { Readable } from "node:stream";

type Data = {
  stream: Readable;
  path: string;
  accession: string;
  application: string;
};

export const validateDigitalFileList = async ({
  stream,
  path,
  accession,
  application,
}: Data): Promise<void> => {
  console.log("Validating Digital File List...");
  const fileType = path.split(".").pop();

  if (fileType === "xlsx") {
    // Handle XLSX validation
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", reject);
    });
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const coverPage = workbook.Sheets["COVER PAGE"];

    if (!coverPage) {
      throw new HttpError(
        HTTP_STATUS_CODES.BAD_REQUEST,
        'The Digital File List must contain a "COVER PAGE" sheet.'
      );
    }

    const cellB2 = coverPage.B2?.v;
    const cellB3 = String(coverPage.B3?.v);
    const cellB4 = String(coverPage.B4?.v);

    if (cellB2 === "" || !cellB2) {
      throw new HttpError(
        HTTP_STATUS_CODES.BAD_REQUEST,
        "The Digital File List is missing the Last Revised Date."
      );
    }
    if (cellB3 && cellB4) {
      if (cellB3 !== accession || cellB4 !== application) {
        throw new HttpError(
          HTTP_STATUS_CODES.BAD_REQUEST,
          "The Digital File List has incorrect accession and/or application number.",
        );
      }
    }
  } else if (fileType === "json") {
    // Handle JSON validation
    let jsonData = "";
    await new Promise<void>((resolve, reject) => {
      stream
        .on("data", (chunk) => {
          jsonData += chunk.toString("utf-8");
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const parsedData = JSON.parse(jsonData);
    const jsonLastRevised = parsedData?.admin?.lastRevised;
    const jsonAccession = parsedData?.admin?.accession;
    const jsonApplication = parsedData?.admin?.application;

    if (!jsonAccession || !jsonApplication || !jsonLastRevised) {
      throw new HttpError(
        HTTP_STATUS_CODES.BAD_REQUEST,
        'The Digital File List is missing one or more of "admin.accession", "admin.application", or "admin.lastRevised".'
      );
    }

    if (jsonLastRevised === "") {
      throw new HttpError(
        HTTP_STATUS_CODES.BAD_REQUEST,
        'The Digital File List is missing "admin.lastRevised".'
      );
    }

    if (jsonAccession !== accession || jsonApplication !== application) {
      throw new HttpError(
        HTTP_STATUS_CODES.BAD_REQUEST,
        'The Digital File List has incorrect "admin.accession" or "admin.application" numbers.'
      );
    }
  }
};
