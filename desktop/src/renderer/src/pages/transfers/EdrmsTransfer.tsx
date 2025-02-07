import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import { Stepper } from "@renderer/components";
import { EdrmsUploadFolderView } from "@renderer/components/transfer/edrms-views";
import { useEffect, useState } from "react";

export const EdrmsTransferPage = () => {
  const [api] = useState(window.api); // Preload scripts

  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [folderPath, setFolderPath] = useState<string | null | undefined>(null);
  const [fileList, setFileList] = useState<File | null | undefined>(undefined);
  const [dataportFile, setDataportFile] = useState<File | null | undefined>(
    undefined
  );
  const [transferForm, setTransferForm] = useState<File | null | undefined>(
    undefined
  );
  const [dataportJson, setDataportJson] = useState<
    Record<string, string>[] | null
  >(null);
  const [dataportToJsonFailed, setDataportToJsonFailed] = useState<
    boolean | null
  >(null);

  const onNextPress = () => {
    setCurrentViewIndex((prev) => prev + 1);
  };

  const parseEdrmsFiles = async (folderPath: string) => {
    const {
      dataport: parsedDataport,
      fileList: parsedFileList,
      transferForm: parsedTransferForm,
    } = await api.transfer.parseEdrmsFiles(folderPath);
    if (parsedDataport && !dataportFile) setDataportFile(parsedDataport);
    if (parsedFileList && !fileList) setFileList(parsedFileList);
    if (parsedTransferForm && !transferForm)
      setTransferForm(parsedTransferForm);
  };

  const parseDataport = async (dataportFile: File) => {
    // Parse file to json
    const dataportJson = await api.transfer.parseTabDelimitedTxt(dataportFile);
    setDataportJson(dataportJson);

    if (!dataportJson) {
      setDataportToJsonFailed(true);
      return;
    }

    // Parse json into admin, folders, and files metadata
    const metadata = api.transfer.parseDataportJsonMetadata(dataportJson);
    // TODO add size and checksums save metadata to state
  };

  useEffect(() => {
    if (folderPath) {
      // Check for edrms files when a new folder is chosen
      parseEdrmsFiles(folderPath);
    }
  }, [folderPath]);

  useEffect(() => {
    if (dataportFile) {
      parseDataport(dataportFile);
    }
  }, [dataportFile]);

  return (
    <Grid container sx={{ paddingBottom: "20px" }}>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack gap={2}>
          <Typography variant="h2">Send records from EDRMS</Typography>
          <Stepper
            items={[
              "EDRMS folder",
              "Dataport file",
              "File list",
              "Transfer form",
              "Submission agreement",
              "Confirmation",
              "Finish",
            ]}
            currentIndex={currentViewIndex}
          />
          {currentViewIndex === 0 && (
            <EdrmsUploadFolderView
              folderPath={folderPath}
              setFolderPath={setFolderPath}
              onNextPress={onNextPress}
            />
          )}
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
