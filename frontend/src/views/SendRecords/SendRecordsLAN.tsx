import React, { useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import Aris617DropZone from "./components/Aris617DropZone";
import SubmissionAgreement from "./components/submissionAgreement";
import UploadService from "../../services/uploadService";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Aris66xDropZone } from "./components/Aris66xDropZone";
import { DatsExcelModel } from "../../utils/xlsxUtils";
import TransferComponent from "./components/TransferComponent";
import ITransferDTO from "../../types/DTO/Interfaces/ITransferDTO";
import { useNavigate } from "react-router-dom";
import { useSSO } from "@bcgov/citz-imb-sso-react";
import DownloadAris662Button from "./components/DownloadAris662Button";

export const SendRecordsLAN = () => {
  const { isAuthenticated } = useSSO();

  useEffect(() => {
    if (!isAuthenticated) window.location.href = "/";
  }, [isAuthenticated]);

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isValid, setIsValid] = useState(false);
  const [isInErrorState, setIsInErrorState] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [beforeNextCompleted, setBeforeNextCompleted] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");
  const [file, setFile] = useState<File | null>(null);
  const [aris617File, setAris617File] = useState<File | null>(null);
  const [excelData, setexcelData] = useState<DatsExcelModel | null>(null);
  const [nextButtonLabel, setNextButtonLabel] = useState("Next");
  const aris66xComponent = useRef<{ validateInputs: () => boolean }>(null);
  const aris617xComponent = useRef<{ validateInputs: () => boolean }>(null);
  const [arisTransferDetails, setArisTransferDetails] =
    useState<ITransferDTO | null>(null);
  const navigate = useNavigate();
  const childRef = useRef<{ validateInputs: () => boolean }>(null); // Define a ref for ChildComponent
  const uploadService = new UploadService();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [allFoldersUploaded, setAllFoldersUploaded] = useState(false);

  useEffect(() => {
    console.log("AllFoldersUploaded: ", allFoldersUploaded);
  }, [allFoldersUploaded]);

  React.useEffect(() => {
    // This code runs before rendering the current step
    switch (activeStep) {
      case 0:
        setNextButtonLabel("Upload File List");
        break;
      case 1:
        setNextButtonLabel("Upload 617 file");
        break;
      case 2:
        setNextButtonLabel("Next");
        break;
      case 3:
        setNextButtonLabel("Next");
        break;
      case 4:
        setNextButtonLabel("Finish");
    }
  }, [activeStep]);
  let steps = [
    {
      label: "Upload File List (ARS 662)",
      beforeNext: async () => {
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("uploadARIS66xfile", file!);
          var res = await uploadService.upload66xFile(formData);
          console.log(res);
          setArisTransferDetails(res.transfer);
          setIsUploading(false);
          showSnackbar("Upload successful", "success");
          setNextButtonLabel("Next");
          setBeforeNextCompleted(true);
        } catch (error) {
          console.error("Upload failed", error);
          showSnackbar("Upload failed", "error");
          setIsUploading(false);
          setIsValid(false);
          setErrors((prev) => [...prev, activeStep]);
          setNextButtonLabel("Upload 66x file");
          return;
        }
      },
      beforeNextCompleted: false,
      content: (
        <Aris66xDropZone
          ref={aris66xComponent}
          showValidationMessage={(isValid, errorMessage) =>
            handleValidationChange(0, isValid, errorMessage)
          }
          setFile={(file) => updateFile(file)}
          setExcelData={setexcelData}
        />
      ),
      validate: () => aris66xComponent.current!!.validateInputs(),
    },
    {
      label: "Upload Transfer Form (ARS 617)",
      beforeNext: async () => {
        //add your update logic here
        setIsUploading(true);
        try {
          const applicationNumber = excelData?.applicationNumber ?? "";
          const accessionNumber = excelData?.accessionNumber ?? "";
          const formData = new FormData();
          formData.append("file", aris617File!);
          formData.append("applicationNumber", applicationNumber);
          formData.append("accessionNumber", accessionNumber);
          var res = await uploadService.uploadFileToDocumentation(formData);
          console.log(res);
          setIsUploading(false);
          showSnackbar("Upload successful", "success");
          setNextButtonLabel("Next");
          setBeforeNextCompleted(true);
        } catch (error) {
          console.error("Upload failed", error);
          showSnackbar("Upload failed", "error");
          setIsUploading(false);
          setIsValid(false);
          setErrors((prev) => [...prev, activeStep]);
          setNextButtonLabel("Upload 617 file");
          return;
        }
      },
      beforeNextCompleted: false,
      content: (
        <Aris617DropZone
          ref={aris617xComponent}
          showValidationMessage={(isValid, errorMessage) =>
            handleValidationChange(1, isValid, errorMessage)
          }
          setFile={(aris617File) => updateAris617File(aris617File)}
        />
      ),
      validate: () => aris617xComponent.current!!.validateInputs(),
    },
    {
      label: "Submission Agreement",
      content: (
        <SubmissionAgreement
          showValidationMessage={(isValid, errorMessage) =>
            handleValidationChange(2, isValid, errorMessage)
          }
          excelData={excelData}
        />
      ),
      validate: () => isValid,
    },
    {
      label: "Confirmation & Receipt",
      content: (
        <TransferComponent
          ref={childRef}
          initialTransfer={arisTransferDetails!!}
          showValidationMessage={(isValid, errorMessage) => {
            handleValidationChange(3, isValid, errorMessage);
          }}
          setAllFoldersUploaded={setAllFoldersUploaded}
        />
      ),
      nextButtonDisabled: !allFoldersUploaded,
      validate: () => allFoldersUploaded,
    },
    {
      label: "Download Files",
      content: (
        <DownloadAris662Button
          arisTransferDetails={arisTransferDetails}
          uploadService={uploadService}
        />
      ),
      validate: () => true,
    },
  ];
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const updateFile = (file: File | null) => {
    setFile(file);
  };

  const updateAris617File = (file: File | null) => {
    setAris617File(file);
  };

  const handleNext = async () => {
    var step = steps[activeStep];
    const validate = step.validate;
    const isValid = validate();
    console.log("isValid" + isValid);
    setIsValid(isValid);
    setIsInErrorState(!isValid);
    if (!isValid) {
      console.log("validate");
      setErrors((prev) => [...prev, activeStep]);
      return;
    }
    if (isValid && step.beforeNext && beforeNextCompleted === false) {
      console.log("beforeNext");
      await step.beforeNext();
      //irrespective of the result of the beforeNext function, we will NOT move to the next step
      //and we will instead wait for the user to click the next button again
      return;
    }
    setNextButtonLabel("Next");
    setErrors((prev) => prev.filter((error) => error !== activeStep));
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setBeforeNextCompleted(false);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setErrors((prev) => prev.filter((error) => error !== activeStep));
    setIsValid(true);
  };

  const handleReset = () => {
    setActiveStep(0);
    setErrors([]);
    setIsValid(true);
    navigate("/dashboard");
  };

  const handleValidationChange = (
    step: number,
    isValid: boolean,
    errorMessage: string
  ) => {
    debugger;
    console.log("validation callback!!");
    steps[step].validate = () => isValid;
    setIsValid(isValid);

    if (!isValid && errorMessage) {
      console.log("validation callback" + errorMessage);
      showSnackbar(errorMessage, "error");
      setErrorMessage(errorMessage);
    } else {
      setErrorMessage("");
    }
  };
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Stepper
        activeStep={activeStep}
        orientation={isSmallScreen ? "vertical" : "horizontal"}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel error={errors.includes(index)}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 2, mb: 1 }}>
        {React.cloneElement(steps[activeStep].content, {
          validate: (isValid: boolean, errorMessage: string) =>
            handleValidationChange(activeStep, isValid, errorMessage),
        })}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          pt: 2,
        }}
      >
        <Box sx={{ flex: "1 1 auto" }} />
        <Box sx={{ m: 1, position: "relative" }}>
          <Button
            disabled={isUploading || steps[activeStep]?.nextButtonDisabled}
            onClick={activeStep === steps.length - 1 ? handleReset : handleNext}
          >
            {nextButtonLabel}
          </Button>
          {isUploading && (
            <CircularProgress
              size={24}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
