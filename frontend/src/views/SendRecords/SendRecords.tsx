import * as React from "react";
import { useCallback, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Aris66xDropZone from "./components/Aris66xDropZone";
import Aris617DropZone from "./components/Aris617DropZone";
import FoldersValidation from "./components/FoldersValidations";
import UploadService from "../../services/uploadService";
import { Box, Button, Step, StepLabel, Stepper } from "@mui/material";

export default function SendRecords() {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const uploadService = new UploadService();

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  const handleValidation = () => {

    console.log("Validating folders");
  };
  const handle66xFileUpload = useCallback((file: File) => {
    const formData = new FormData();
    formData.append("uploadARIS66xfile", file);


    uploadService
      .upload66xFile(formData)
      .then((response) => {
        console.log(response);
        setFolders(response.folders || []);

      })
      .catch((error) => {
        console.error("Upload error:", error);
        // Handle the error as needed
      });
  }, []);

  const handle617FileUpload = useCallback((file: File) => {
    const formData = new FormData();
    formData.append("uploadARIS617file", file);

    // Assuming uploadService.upload66xFile returns a Promise
    uploadService
      .upload617File(formData)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error("Upload error:", error);
        // Handle the error as needed
      });
  }, []);
  const steps = [
    'Upload your 66x Digital Data List Excel Sheets',
    'Validates the folders identified from the Digital File List',
    'Uploads their approved Transfer form',
    'View and Accept the Submission Agreement.',
    'Review and Confirmed the Records Importation'
  ];

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);
  const handleReset = () => setActiveStep(0);

  const getStepContent = (index: number) => {
    switch (index) {
      case 0:
        return <Aris66xDropZone handleFileUpload={(file) => handle66xFileUpload(file)} />;
      case 1:
        return <FoldersValidation folders={folders} onValidation={handleValidation} />
      case 2:
        return <Aris617DropZone handleFileUpload={handle617FileUpload} />
      case 3:
        return  <Typography>
        Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas augue. Duis vel est augue.
      </Typography>
      case 4:
        return <Typography>
        Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas augue. Duis vel est augue.
      </Typography>
      default:
        return 'Unknown step';
    }
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleReset}>
              Reset
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </div>
    </Box>
  );
}
