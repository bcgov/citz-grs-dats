export const validateAccessionNumber = (value: string) => {
  if (!value) return "Accession number is required";
  if (!/^\d{2}-\d{4}$/.test(value))
    return "Format must be ##-#### (e.g., 12-3456)";
  return null;
}

export const validateApplicationNumber = (value: string) => {
  if (!value) return "Application number is required";
  if (!/^\d{6}$/.test(value)) return "Format must be ###### (e.g., 123456)";
  return null;
}
