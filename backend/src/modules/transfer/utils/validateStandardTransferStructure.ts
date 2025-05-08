import type { Readable } from "node:stream";
import unzipper from "unzipper";
import {
  HttpError,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";

type Data = {
  stream: Readable;
};

type FileCheck = {
  regex: RegExp;
  allowedExtensions: string[];
  parentDirectory: string;
  errorMessage: string;
};

const fileChecks: FileCheck[] = [
  {
    regex: /^(Digital_File_List|File\sList)/,
    allowedExtensions: ["xlsx", "json"],
    parentDirectory: "documentation",
    errorMessage:
      "Digital File List (beginning with 'Digital_File_List' or 'File List') must be included and have a .xlsx or .json extension in the documentation directory.",
  },
  {
    regex: /^(Transfer_Form|617)/,
    allowedExtensions: ["pdf"],
    parentDirectory: "documentation",
    errorMessage:
      "Transfer Form ARS 617 (beginning with 'Transfer_Form' or '617') must be included and have a .pdf extension in the documentation directory.",
  },
  {
    regex: /^Submission_Agreement/,
    allowedExtensions: ["pdf"],
    parentDirectory: "documentation",
    errorMessage:
      "Submission Agreement (beginning with 'Submission_Agreement') must be included and have a .pdf extension in the documentation directory.",
  },
  {
    regex: /^admin/,
    allowedExtensions: ["json"],
    parentDirectory: "metadata",
    errorMessage: "admin.json must be included in the metadata directory.",
  },
  {
    regex: /^files/,
    allowedExtensions: ["json"],
    parentDirectory: "metadata",
    errorMessage: "files.json must be included in the metadata directory.",
  },
  {
    regex: /^folders/,
    allowedExtensions: ["json"],
    parentDirectory: "metadata",
    errorMessage: "folders.json must be included in the metadata directory.",
  },
];

export const validateStandardTransferStructure = async ({
  stream,
}: Data): Promise<void> => {
  console.log("Validating standard transfer structure...");

  const requiredDirectories = new Set(["content", "documentation", "metadata"]);
  const foundTopLevelEntries = new Set<string>();
  const foundFiles = new Set<string>();

  try {
    const zipEntries = stream.pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of zipEntries) {
      const { path, type } = entry;
      const topLevelEntry = path.split("/")[0];

      if (requiredDirectories.has(topLevelEntry))
        foundTopLevelEntries.add(topLevelEntry);

      if (type === "File") foundFiles.add(path);

      entry.autodrain();
    }
  } catch (err) {
    console.error("Error during zip processing:", err);
    throw err;
  }

  const missingDirectories = [...requiredDirectories].filter(
    (dir) => !foundTopLevelEntries.has(dir)
  );

  if (missingDirectories.length > 0) {
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      `Zip file is missing required directories: ${missingDirectories.join(
        ", "
      )}.`
    );
  }

  const missingFiles = fileChecks.filter((check) => {
    return ![...foundFiles].some(
      (foundFile) =>
        foundFile.startsWith(`${check.parentDirectory}/`) &&
        check.regex.test(foundFile.split("/").pop() || "")
    );
  });

  if (missingFiles.length > 0) {
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      `The zip file is missing required files: ${missingFiles
        .map((file) => file.errorMessage)
        .join(" ")}`
    );
  }
};
