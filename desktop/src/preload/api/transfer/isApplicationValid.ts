export const isApplicationValid = (application?: string) => {
  if (!application) return false;
  return (
    application !== "" &&
    !Number.isNaN(Number(application.replaceAll(" ", "a")))
  );
};
