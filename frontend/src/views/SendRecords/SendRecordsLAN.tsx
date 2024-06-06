import * as React from "react";
import { useCallback, useState } from "react";
import Typography from "@mui/material/Typography";
import Aris617DropZone from "./components/Aris617DropZone";
import SubmissionAgreement from "./components/submissionAgreement";
import UploadService from "../../services/uploadService";
import {
  Alert,
  AlertColor,
  Box,
  Button,
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
  const [excelData, setexcelData] = useState<DatsExcelModel | null>(null);
  const [nextButtonLabel, setNextButtonLabel] = useState("Upload 66x file"); //because the first step is to upload the 66x file
  const [arisTransferDetails,setArisTransferDetails] = useState<ITransferDTO | null>(null);
  const uploadService = new UploadService();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
      label: "Upload approved Transfer form",
      content: <Aris617DropZone />,
      validate: () => true,
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
      content: (
        <TransferComponent transfer={arisTransferDetails!!}
        />
      ),
      validate: () => true,
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
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{ mr: isSmallScreen ? 0 : 1, mb: isSmallScreen ? 1 : 0 }}
        >
          Back
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        <Button
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

    //     <Grid container justifyContent="center" spacing={2}>
    //     <Grid item xs={12}>
    //     <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%' }}>
    //         {steps.map((step) => (
    //             <Step key={step.label}>
    //                 <StepLabel>{step.label}</StepLabel>
    //             </Step>
    //         ))}
    //     </Stepper>
    //    </Grid>
    //    <Grid item xs={11}>
    //    <Paper elevation={2} sx={{ width: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px' }}>
    //         {steps[activeStep].content}
    //     </Paper>
    //     </Grid>
    //     <Grid item xs={11} sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
    //         <Button disabled={activeStep === 0} onClick={handleBack}>
    //             Back
    //         </Button>
    //         <Button variant="contained" onClick={handleNext}>
    //             {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
    //         </Button>
    //         {activeStep === steps.length && (
    //             <Button onClick={handleReset}>
    //                 Reset
    //             </Button>
    //         )}
    //     </Grid>
    // </Grid>
  );
};
