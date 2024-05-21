import * as React from "react";
import { useCallback, useState } from "react";
import Typography from "@mui/material/Typography";
import Aris66xDropZone from "./components/Aris66xDropZone";
import Aris617DropZone from "./components/Aris617DropZone";
import SubmissionAgreement from "./components/SubmissionAgreement";
import UploadService from "../../services/uploadService";
import { Box, Button, Step, StepLabel, Stepper } from "@mui/material";
import GenericStepper from "../../components/GenericStepper";

export default function SendRecords() {
  const [folders] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const uploadService = new UploadService();

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
    { label: 'Upload 66x file', content: <Aris66xDropZone /> },
    { label: 'Upload approved Transfer form', content: <Aris617DropZone /> },
    { label: 'Accept Terms.', content: <SubmissionAgreement /> },
    { label: 'Review and Uplaod', content: <Typography>Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas augue. Duis vel est augue.  </Typography> },
    { label: 'Download Files', content: <Typography>Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas augue. Duis vel est augue.  </Typography> },
  ];
  return <GenericStepper steps={steps} />;
}
