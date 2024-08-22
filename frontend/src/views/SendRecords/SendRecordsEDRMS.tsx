import React, { useRef, useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
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
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate } from "react-router-dom";
import Aris617DropZone from "./components/Aris617DropZone";
import SubmissionAgreement from "./components/submissionAgreement";
import TransferComponent from "./components/TransferComponent";
import UploadService from "../../services/uploadService";
import { DatsExcelModel } from "../../utils/xlsxUtils";
import ITransferDTO from "../../types/DTO/Interfaces/ITransferDTO";
import { DataportTxtDropZone } from "./components/DataportTxtDropZone";
import { useSSO } from "@bcgov/citz-imb-sso-react";

const SendRecordsEDRMS = () => {
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
  const [excelData, setExcelData] = useState<DatsExcelModel | null>(null);
  const [nextButtonLabel, setNextButtonLabel] = useState("Next");
  const [arisTransferDetails, setArisTransferDetails] =
    useState<ITransferDTO | null>(null);
  const dataportComponent = useRef<{ validateInputs: () => boolean }>(null);
  const aris617xComponent = useRef<{ validateInputs: () => boolean }>(null);
  const fileListComponent = useRef<{
    validateInputs: () => boolean;
    clearFiles: () => void;
  }>(null);

  const navigate = useNavigate();
  const childRef = useRef<any>(null);
  const uploadService = new UploadService();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const labels = [
      "Upload Dataport file",
      "Upload File List",
      "Upload 617 file",
      "Next",
      "Upload All",
      "Finish",
    ];
    setNextButtonLabel(labels[activeStep] || "Next");
  }, [activeStep]);
  const updateFile = (file: File | null) => {
    setFile(file);
  };

  const updateAris617File = (file: File | null) => {
    setAris617File(file);
  };
  const steps = [
    {
      label: "Upload Dataport file",
      beforeNext: async () =>
        await handleUpload(file, uploadService.uploadDataportFile),
      content: (
        <DataportTxtDropZone
          ref={dataportComponent}
          validate={(isValid, errorMessage) =>
            handleValidationChange(0, isValid, errorMessage)
          }
          setFile={updateFile}
          setExcelData={setExcelData}
        />
      ),
      validate: () => dataportComponent.current!!.validateInputs(),
    },
    {
      label: "Upload File List",
      beforeNext: async () => {
        //add your update logic here
        setIsUploading(true);
        try {
          const applicationNumber = excelData?.applicationNumber ?? '';
          const accessionNumber = excelData?.accessionNumber ?? '';
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
      content: (
        <Aris617DropZone
          ref={fileListComponent}
          showValidationMessage={(isValid, errorMessage) =>
            handleValidationChange(0, isValid, errorMessage)
          }
          setFile={updateAris617File}
        />
      ),
      validate: () => fileListComponent.current!!.validateInputs(),
    },
    {
      label: "Upload Transfer Form (ARS 617)",
      beforeNext: async () => {
        //add your update logic here
        setIsUploading(true);
        try {
          const applicationNumber = excelData?.applicationNumber ?? '';
          const accessionNumber = excelData?.accessionNumber ?? '';
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
      content: (
        <Aris617DropZone
          ref={aris617xComponent}
          showValidationMessage={(isValid, errorMessage) =>
            handleValidationChange(0, isValid, errorMessage)
          }
          setFile={updateAris617File}

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
      beforeNext: async () => {
        if (childRef.current) {
          setIsUploading(true);
          childRef.current.uploadAllFolders();
          if (isValid) {
            setIsUploading(false);
            showSnackbar(
              "The Upload is initiated successfully and will continue in the background",
              "success"
            );
            setNextButtonLabel("Next");
            setBeforeNextCompleted(true);
          }
        }
      },
      content: (
        <TransferComponent
          ref={childRef}
          initialTransfer={arisTransferDetails!!}
          showValidationMessage={(isValid, errorMessage) =>
            handleValidationChange(3, isValid, errorMessage)
          }
        />
      ),
      validate: () => childRef.current!!.validateInputs(),
    },
    {
      label: "Download Files",
      content: (
        <Typography>
          DATS will display a “Transfer complete message” and a “Thanks Message
          or text” at this last step and a link to download the new Digital File
          List (ARS 66X)
        </Typography>
      ),
      validate: () => true,
    },
  ];

  const handleUpload = async (file: File | null, uploadFunc: Function) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file!);
      const res = await uploadFunc(formData);
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
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleNext = async () => {
    const step = steps[activeStep];
    const isValid = step.validate ? step.validate() : true;
    setIsValid(isValid);
    setIsInErrorState(!isValid);

    if (!isValid) {
      setErrors((prev) => [...prev, activeStep]);
      return;
    }

    if (isValid && step.beforeNext && !beforeNextCompleted) {
      await step.beforeNext();
      return;
    }

    setNextButtonLabel("Next");
    setErrors((prev) => prev.filter((error) => error !== activeStep));
    if (activeStep === 1) {
      setFile(null);
      fileListComponent.current!!.clearFiles();
    }
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
    steps[step].validate = () => isValid;
    setIsValid(isValid);

    if (!isValid && errorMessage) {
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
            disabled={isUploading}
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

export default SendRecordsEDRMS;
