import { getDocument } from "pdfjs-dist";
import { HttpError, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import type { Buffer } from "node:buffer";

type Data = {
	buffer: Buffer;
	accession: string;
	application: string;
};

// Polyfill
if (!Promise.withResolvers) {
	Promise.withResolvers = <T>() => {
		let resolve: (value: T | PromiseLike<T>) => void;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let reject: (reason?: any) => void;

		const promise = new Promise<T>((res, rej) => {
			resolve = res;
			reject = rej;
		});

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		return { promise, resolve: resolve!, reject: reject! };
	};
}

export const validateSubmissionAgreement = async ({
	buffer,
	accession,
	application,
}: Data): Promise<void> => {
	try {
		// Convert Buffer to Uint8Array
		const data = new Uint8Array(buffer);

		const loadingTask = getDocument({ data });
		const pdf = await loadingTask.promise;

		let fullText = "";

		// Extract text from each page
		for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
			const page = await pdf.getPage(pageNum);
			const textContent = await page.getTextContent();
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			fullText += textContent.items.map((item) => (item as any).str).join(" ");
		}

		const expectedAccessionApplicationText = `Accession # ${accession} and Application # ${application}`;

		// Validate the content for correct accession and application #s
		if (!fullText.includes(expectedAccessionApplicationText)) {
			throw new HttpError(
				HTTP_STATUS_CODES.BAD_REQUEST,
				"Incorrect or missing accession and application numbers.",
			);
		}
	} catch (error) {
		if (error instanceof Error) {
			// Handle errors with `message` property
			if (error.message.includes("Invalid PDF structure")) {
				throw new HttpError(
					HTTP_STATUS_CODES.BAD_REQUEST,
					"Invalid file: The provided buffer is not a valid PDF.",
				);
			}

			throw new HttpError(
				HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
				`An error occurred while validating the PDF: ${error.message}`,
			);
		}

		// Fallback for non-Error objects
		throw new HttpError(
			HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
			"An unknown error occurred while validating the PDF.",
		);
	}
};
