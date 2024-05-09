import * as React from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { Card } from "@mui/material";

import CreateFileListCard from "./components/CreateFileListCard";
import SendRecordsCard from "./components/SendRecordsCard";
import ViewTransferStatusCard from "./components/ViewTransferStatusCard";

export default function RowAndColumnSpacing() {
  return (
    <Box sx={{ width: "100%" }}>
      <Grid container rowSpacing={5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid xs={4}>
          <CreateFileListCard />
        </Grid>
        <Grid xs={4}>
          <SendRecordsCard />
        </Grid>
        <Grid xs={4}>
          <ViewTransferStatusCard />
        </Grid>
        <Grid xs={6}>
          <CreateFileListCard />
        </Grid>
      </Grid>
    </Box>
  );
}
