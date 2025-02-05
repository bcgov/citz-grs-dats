import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import { Stepper } from "@renderer/components";
import { useState } from "react";

export const EdrmsTransferPage = () => {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  const onNextPress = () => {
    setCurrentViewIndex((prev) => prev + 1);
  };

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
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
