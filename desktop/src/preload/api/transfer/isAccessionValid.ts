// Accession should be a number with a single dash in it.
export const isAccessionValid = (accession: string) => {
  return (
    accession !== "" &&
    !Number.isNaN(Number(accession.replace("-", "").replaceAll(" ", "a")))
  );
};
