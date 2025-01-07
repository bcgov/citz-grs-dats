import type { Buffer } from "node:buffer";
import { HttpError, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import xlsx from "xlsx";

type Data = {
	buffer: Buffer;
	accession: string;
	application: string;
};

export const validateDigitalFileList = async ({
	buffer,
	accession,
	application,
}: Data): Promise<void> => {
	// Check file type
	const bufferType = buffer.toString("hex", 0, 4);
	const isXlsx = bufferType === "504b0304"; // Zip header for .xlsx files

	let isJson = false;

	try {
		// Attempt to parse buffer as JSON to confirm it's a valid JSON file
		JSON.parse(buffer.toString("utf-8"));
		isJson = true;
	} catch {
		isJson = false;
	}

	if (!isXlsx && !isJson) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			"The Digital File List must be a .xlsx or .json file.",
		);
	}

	if (isXlsx) {
		// Handle XLSX validation
		const workbook = xlsx.read(buffer, { type: "buffer" });
		const coverPage = workbook.Sheets["COVER PAGE"];

		if (!coverPage) {
			throw new HttpError(
				HTTP_STATUS_CODES.BAD_REQUEST,
				'The Digital File List must contain a "COVER PAGE" sheet.',
			);
		}

		const cellB2 = coverPage.B2?.v;
		const cellB3 = String(coverPage.B3?.v);
		const cellB4 = String(coverPage.B4?.v);

		if (cellB2 === "" || !cellB2) {
			throw new HttpError(
				HTTP_STATUS_CODES.BAD_REQUEST,
				"The Digital File List is missing the Last Revised Date.",
			);
		}

		if (cellB3 !== accession || cellB4 !== application) {
			throw new HttpError(
				HTTP_STATUS_CODES.BAD_REQUEST,
				"The Digital File List has a missing or incorrect accession and/or application number.",
			);
		}
	} else if (isJson) {
		// Handle JSON validation
		const jsonData = JSON.parse(buffer.toString("utf-8"));
		const jsonLastRevised = jsonData?.admin?.lastRevised;
		const jsonAccession = jsonData?.admin?.accession;
		const jsonApplication = jsonData?.admin?.application;

		if (!jsonAccession || !jsonApplication || !jsonLastRevised) {
			throw new HttpError(
				HTTP_STATUS_CODES.BAD_REQUEST,
				'The Digital File List is missing one or more of "admin.accession", "admin.application", or "admin.lastRevised".',
			);
		}

		if (jsonLastRevised === "") {
			throw new HttpError(
				HTTP_STATUS_CODES.BAD_REQUEST,
				'The Digital File List is missing "admin.lastRevised".',
			);
		}

		if (jsonAccession !== accession || jsonApplication !== application) {
			throw new HttpError(
				HTTP_STATUS_CODES.BAD_REQUEST,
				'The Digital File List has incorrect "admin.accession" or "admin.application" numbers.',
			);
		}
	}
};
