export const isApplicationValid = (application: string) => {
  return (
    application !== "" &&
    !Number.isNaN(Number(application.replaceAll(" ", "a")))
  );
};
