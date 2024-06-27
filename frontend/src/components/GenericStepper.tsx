import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Button, Typography, Grid, Box, Paper } from '@mui/material';

type StepConfig = {
    label: string;
    content: React.ReactNode;
};

type GenericStepperProps = {
    steps: StepConfig[];
    contentHeight?: string;  // Optional prop to set fixed content height
};

export default function GenericStepper({ steps, contentHeight = '500px' }: GenericStepperProps) {
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return (
            <Grid container justifyContent="center" spacing={2}>
            <Grid item xs={12}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%' }}>
                {steps.map((step) => (
                    <Step key={step.label}>
                        <StepLabel>{step.label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
           </Grid>
           <Grid item xs={11}>
           <Paper elevation={2} sx={{ width: '100%', minHeight: contentHeight, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px' }}>
                {steps[activeStep].content}
            </Paper>
            </Grid>
            <Grid item xs={11} sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                    Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
                {activeStep === steps.length && (
                    <Button onClick={handleReset}>
                        Reset
                    </Button>
                )}
            </Grid>
        </Grid>
    );
}
