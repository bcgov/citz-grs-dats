export type ToastData = {
  success: boolean;
  title: string;
  message: string;
};

export const getXlsxFileListToastData = (msg: string): ToastData => {
  let toastData = {
    success: false,
    title: "An unexpected error occurred",
    message: msg,
  };

  if (msg === "Missing accession and/or application.")
    toastData = {
      success: false,
      title: "Missing accession and/or application number",
      message:
        "Your file list (ARS 662) is missing an accession and/or application number. Please add this information to the ‘Cover Page’ tab in the file list and save it, then try uploading the file again.",
    };

  if (msg === "Duplicate folder in file list.")
    toastData = {
      success: false,
      title: "Duplicate folder",
      message:
        "Your file list (ARS 662) includes duplicate folders. Please remove duplicate folders from the ‘File List’ tab in the file list and save it, then try uploading the file again.",
    };

  if (msg === "Folders is missing schedule and/or classification.")
    toastData = {
      success: false,
      title: "Missing schedule and/or classification value",
      message:
        "Your file list (ARS 662) is missing a schedule and/or classification value. Please review this information in the ‘File list’ tab of your file list and save it, then try uploading the file again.",
    };

  if (msg === "Invalid accession and/or application.")
    toastData = {
      success: false,
      title: "Invalid accession and/or application number",
      message:
        "Your file list (ARS 662) has an invalid accession and/or application number. Please make sure to only use numbers or dashes. Please update this information in the ‘Cover Page’ tab of the file list and save it, then try uploading the file again.",
    };

  if (msg === 'Missing on or more of ["COVER PAGE", "FILE LIST"].')
    toastData = {
      success: false,
      title: "File List is malformed",
      message:
        "Your file list (ARS 662) is missing a ‘Cover Page’ and/or ‘File List’ sheet. Please only use Digital File List's created in DATS.",
    };

  if (msg === "Folders is empty.")
    toastData = {
      success: false,
      title: "Missing File List data",
      message:
        "Your file list (ARS 662) is missing folder data. Please add this information to the ‘File List’ tab in the file list and save it, then try uploading the file again.",
    };

  return toastData;
};
