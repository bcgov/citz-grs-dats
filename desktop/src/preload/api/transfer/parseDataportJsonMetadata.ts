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

export const parseDataportJsonMetadata = (items: Record<string, string>[]) => {
  if (!items.length)
    return { accession: "", application: "", folders: {}, files: {} };

  const accession = items[0]["Accession Number"];
  const application = items[0]["Consignment (Application)"];
  const folders: Record<string, unknown> = {};
  const files: Record<string, unknown[]> = {};

  items.forEach((item) => {
    const container = item["Container (Folder/Box)"];
    const expandedNumber = item["Expanded Number"];

    if (!container) {
      const { schedule, classification } = parseClassification(
        item.Classification
      );
      folders[expandedNumber] = {
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
      if (!files[container]) files[container] = [];
      files[container].push({
        filepath: `${container}/${filename}`,
        filename,
        size: "",
        checksum: "",
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
  });

  return { accession, application, folders, files };
};
