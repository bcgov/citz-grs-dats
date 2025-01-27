export const applicationExists = (application?: string) => {
  return !!application && application !== "";
};

export const isApplicationValid = (application?: string) => {
  if (!application) return false;
  return !Number.isNaN(Number(application.replaceAll(" ", "a")));
};
