import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const parseDate = (dateStr: string): string => {
  if (!dateStr) return "";
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(
      6,
      8
    )}`;
  }
  const timestamp = Number(dateStr);
  if (Number.isNaN(timestamp) || timestamp < 1e12) return "";
  const parsedDate = new Date(timestamp / 1000).toISOString().split("T")[0];
  return parsedDate;
};

const parseClassification = (
  classification: string
): { schedule: string; classification: string } => {
  const match = classification.match(/REMS-(\d+-\d+) : (\d+)/);
  if (!match) return { schedule: "", classification: "" };
  return { schedule: match[2], classification: match[1] };
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${(size / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};

const getFileSizeAndChecksum = async (filePath: string) => {
  try {
    const stats = await fs.stat(filePath);
    const size = formatFileSize(stats.size);

    // Read file content for checksum
    const fileBuffer = await fs.readFile(filePath);
    const hash = crypto
      .createHash("sha256")
      .update(new Uint8Array(fileBuffer))
      .digest("hex");

    return { size, checksum: hash };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return { size: "0 B", checksum: "" };
  }
};

export const parseDataportJsonMetadata = async (
  items: Record<string, string>[],
  folderPath: string
) => {
  if (!items.length)
    return { accession: "", application: "", folders: {}, files: {} };

  const accession = items[0]["Accession Number"];
  const application = items[0]["Consignment (Application)"];
  const folders: Record<string, unknown> = {};
  const files: Record<string, unknown[]> = {};

  for (const item of items) {
    const container = item["Container (Folder/Box)"];
    const expandedNumber = item["Expanded Number"];

    if (!container || !container.includes("/")) {
      const expandedNumberParts = expandedNumber.split("/");
      const folderName = `${
        expandedNumberParts[0]
      }_${expandedNumberParts[1].replace(/^0+/, "")}`;
      const { schedule, classification } = parseClassification(
        item.Classification
      );
      folders[folderName] = {
        schedule,
        classification,
        file: item["Retrieval Code"],
        opr: item["Series record"] === "OPR",
        startDate: parseDate(item["Date Created (Opened)"]),
        endDate: parseDate(item["Date Closed"]),
        soDate: parseDate(item["SO Date"]),
        fdDate: "-",
      };
    } else {
      const filename = item["DOS file"].split(/\\+/).pop() || "";
      const filePath = path.join(folderPath, filename.replaceAll('"', ""));
      const containerParts = container.split("/");
      const folderName = `${containerParts[0]}_${containerParts[1].replace(
        /^0+/,
        ""
      )}`;

      const { size, checksum } = await getFileSizeAndChecksum(filePath);

      if (!files[folderName]) files[folderName] = [];
      files[folderName].push({
        filepath: `${folderName}/${filename}`,
        filename,
        size,
        checksum,
        birthtime: parseDate(item["Date Created (Opened)"]),
        lastModified: parseDate(item["Date Modified"]),
        lastAccessed: "-",
        lastSaved: "-",
        authors: "-",
        owner: `EDRMS Creator: ${item["Creator: Name"]}`,
        company: `EDRMS Owner-Name: ${item["Owner: Name"]}`,
        computer: "-",
        contentType: item["Internet Media Type"],
        programName: "-",
      });
    }
  }

  return { admin: { accession, application }, folders, files };
};
