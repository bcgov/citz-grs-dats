export const accessionExists = (accession?: string) => {
  return !!accession && accession !== "";
};

// Accession should be a number with a single dash in it.
export const isAccessionValid = (accession?: string) => {
  if (!accession) return false;
  return !Number.isNaN(Number(accession.replace("-", "").replaceAll(" ", "a")));
};
