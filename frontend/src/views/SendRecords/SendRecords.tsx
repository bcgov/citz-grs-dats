import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import CardComponent from "../../components/Card/CardComponent";

const SendRecords: React.FC = () => {
  return (
    <Box style={{ marginBottom: "45px" }}>
      <Typography sx={{ fontSize: "1.1em", fontWeight: "700" }}>
        Transfer Records
      </Typography>
      <Typography>Before you begin you must have:</Typography>
      <ol>
        <li>Approved Transfer Form (ARS 617).</li>
        <li>Approved Digital File List (ARS 662).</li>
        <li>
          Be ready to update any LAN Drive folder addresses that may have
          changed since you created the File List.
        </li>
      </ol>
      <br />
      <Typography>
        Please note the process takes considerable time. If you have a large
        transfer (e.g. 5 GB), schedule your work to let DATS run for 3 hours. We
        are working on making the service faster in future versions of DATS.
      </Typography>
      <br />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Send Records from LAN Drive"
            content="Transfer approved Full Retention (FR) records to the Digital Archives, from a LAN drive."
            link="/send-lan"
            additionalContent={
              <Box sx={{ marginTop: "-30px" }}>
                <Typography sx={{ fontSize: "0.7em" }}>
                  Before you begin, have the following ready to complete the
                  process:
                </Typography>
                <ol style={{ fontSize: "0.7em" }}>
                  <li>Approved Digital File List (ARS 662).</li>
                  <li>Approved Transfer form (ARS 617).</li>
                </ol>
                <Typography sx={{ fontSize: "0.7em" }}>
                  You should also be ready to relink any folders whose names
                  have changed since the file list was first created.
                </Typography>
              </Box>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Send Record from EDRMS"
            content="Transfer approved Full Retention (FR) records to the Digital Archives, from EDRMS."
            link="/send-edrms"
            additionalContent={
              <Box sx={{ marginTop: "-30px" }}>
                <Typography sx={{ fontSize: "0.7em" }}>
                  Before you begin, have the following ready to complete the
                  process:
                </Typography>
                <ol style={{ fontSize: "0.7em" }}>
                  <li>EDRMS DataPort text file.</li>
                  <li>Approved Transfer form (ARS 617).</li>
                  <li>Approved EDRMS File List.</li>
                </ol>
                <Typography sx={{ fontSize: "0.7em" }}>
                  You should also have one folder of records that were extracted
                  and sent to you by the EDRMS team.
                </Typography>
              </Box>
            }
          />
        </Grid>
      </Grid>
      <br />
      <Typography>
        If you need assistance please{" "}
        <a href="https://www2.gov.bc.ca/gov/content?id=FE683E9D3E3F4CD19AA03BF979D4EC23 ">
          contact your GIM Specialists
        </a>
        .
      </Typography>
    </Box>
  );
};

export default SendRecords;
