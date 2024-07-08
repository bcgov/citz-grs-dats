import * as React from "react";
import { useCallback, useRef, useState } from "react";
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
  Grid,
  Paper,
  Snackbar,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { Aris66xDropZone } from "./components/Aris66xDropZone";
import { DatsExcelModel } from "../../utils/xlsxUtils";
import TransferComponent from "./components/TransferComponent";
import ITransferDTO from "../../types/DTO/Interfaces/ITransferDTO";
import { Aris66UploadResponse } from "../../types/DTO/Interfaces/Aris66UploadResponse";

export const SendRecordsLAN = () => {
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

  const [arisTransferDetails, setArisTransferDetails] =
    useState<ITransferDTO | null>(null);
    const childRef = useRef<any>(null); // Define a ref for ChildComponent
  const uploadService = new UploadService();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  React.useEffect(() => {
    // This code runs before rendering the current step
    switch (activeStep) {
      case 0:
        setNextButtonLabel("Upload 66x file");
        break;
      case 1:
        setNextButtonLabel("Upload 617 file");
        break;
      case 2:
        setNextButtonLabel("Next");
        break;
      case 3:
        setNextButtonLabel("Upload All");
        break;
        case 4:
          setNextButtonLabel("Finish");
    }
  }, [activeStep]);
  let steps = [
    {
      label: "Upload 66x file",
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
          validate={(isValid, errorMessage) =>
            handleValidationChange(0, isValid, errorMessage)
          }
          setFile={(file) => updateFile(file)}
          setExcelData={setexcelData}
        />
      ),
      validate: () => isValid,
    },
    {
      label: "Upload approved 617 Transfer form ",
      beforeNext: async () => {
        //add your update logic here
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("uploadARIS617file", aris617File!);
          var res = await uploadService.upload617File(formData);
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
          validate={(isValid, errorMessage) =>
            handleValidationChange(1, isValid, errorMessage)
          }
          setFile={(aris617File) => updateAris617File(aris617File)}
        />
      ),
      validate: () => isValid,
    },
    {
      label: "Accept Terms.",
      content: (
        <SubmissionAgreement
          validate={(isValid, errorMessage) =>
            handleValidationChange(2, isValid, errorMessage)
          }
          excelData={excelData}
        />
      ),
      validate: () => isValid,
    },
    {
      label: "Review and Upload",
      beforeNext: async () => {
        if (childRef.current) {
          setIsUploading(true);
          childRef.current.uploadAllFolders();
          setIsUploading(false);
          showSnackbar("The Upload is initiated successfully and will continue in the background", "success");
          setNextButtonLabel("Next");
          setBeforeNextCompleted(true);
        }
      },
      content: <TransferComponent ref={childRef} initialTransfer={arisTransferDetails!!} validate={(isValid, errorMessage) => {
        handleValidationChange(3, isValid, errorMessage);
      }} />,
      validate: () => isValid,
    },
    {
      label: "Download Files",
      content: (
        <Typography>
          DATS will display a “Transfer complete message” and a “Thanks Message
          or text” at this last step and a link to download the new Digital File
          List (ARS 66X){" "}
        </Typography>
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
    console.log("--------------------------------------handleNext");
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
  };

  const handleValidationChange = (
    step: number,
    isValid: boolean,
    errorMessage: string
  ) => {
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
        {/* <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{ mr: isSmallScreen ? 0 : 1, mb: isSmallScreen ? 1 : 0 }}
        >
          Back
        </Button> */}
        <Box sx={{ flex: "1 1 auto" }} />
        <Box sx={{ m: 1, position: 'relative' }}>
        <Button disabled={isUploading}
          {...(!isInErrorState
            ? { variant: "contained" }
            : {
                variant: "outlined",
                color: "error",
                startIcon: <ErrorIcon />,
              })}
          onClick={activeStep === steps.length - 1 ? handleReset : handleNext}
        >
          {nextButtonLabel}
        </Button>
        {isUploading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
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
