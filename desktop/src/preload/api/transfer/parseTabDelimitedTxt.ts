export const parseTabDelimitedTxt = (
  file: File
): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file."));
      }

      const text = event.target.result as string;
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== ""); // Split lines, remove empty ones
      if (lines.length < 2) {
        return reject(
          new Error("File must have at least a header row and one data row.")
        );
      }

      const headers = lines[0].split("\t"); // Assume tab as the delimiter
      const jsonData = lines.slice(1).map((line) => {
        const values = line.split("\t");
        return headers.reduce<Record<string, string>>((obj, header, index) => {
          obj[header] = values[index] ?? ""; // Assign empty string if value is missing
          return obj;
        }, {});
      });

      resolve(jsonData);
    };

    reader.onerror = () => reject(new Error("Error reading file."));
    reader.readAsText(file);
  });
};
