import React, { ReactElement, FC, useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Container,
  Paper,
  Link,
  Button,
} from "@mui/material";
import TransfersTable from "./components/TransfersTable";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const ViewTransferStatus: FC<any> = (): ReactElement => {
  const [isCreatetModalOpen, setIsCreateModalOpen] = useState(false);
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Paper>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 650,
            }}
          >
            <TransfersTable />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            Test 3
          </Paper>
        </Grid>
      </Grid>
      <Copyright sx={{ pt: 4 }} />
    </Container>
  );
};

export default ViewTransferStatus;
