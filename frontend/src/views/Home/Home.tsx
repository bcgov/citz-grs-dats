import * as React from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { Card } from "@mui/material";

import CreateFileListCard from "./components/CreateFileListCard";
// import SendRecordsCard from "./components/SendRecordsCard";
// import ViewTransferStatusCard from "./components/ViewTransferStatusCard";

// const Item = styled(Card)(({ theme }) => ({
//   backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
//   ...theme.typography.body2,
//   padding: theme.spacing(1),
//   textAlign: "center",
//   color: theme.palette.text.secondary,
// }));

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
