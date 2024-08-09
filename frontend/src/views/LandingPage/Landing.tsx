import "./Landing.css";
import { Typography } from "@mui/material";
import { Button } from "@bcgov/design-system-react-components";
import { useSSO } from "@bcgov/citz-imb-sso-react";

const Landing: React.FC = () => {
  const { login } = useSSO();
  return (
    <div className="Landing">
      <main>
        <div className="content">
          <Typography sx={{ fontSize: "1.3em", fontWeight: "700" }}>
            Welcome to DATS. This application helps you:
          </Typography>
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <li>Create digital file lists.</li>
            <li>Transfer digital records as evidence.</li>
          </ul>
          <br />
          <Typography>
            DATS is part of the transfer process for Full Retention (FR)
            archival records. The first step in the process is creating a
            Transfer form (ARS 617). The next step is using DATS to create a
            digital file list (ARS 662). Then you will submit the transfer form
            and file list to GIM staff who will provide a quality assurance
            review. After the review you can use DATS to transfer your digital
            FR records to the archives.
          </Typography>

          <Button
            style={{ margin: "15px" }}
            onPress={() =>
              login({ idpHint: "idir", postLoginRedirectURL: "/dashboard" })
            }
          >
            Login to continue
          </Button>

          <Typography>
            To learn more about the Transfer process visit the{" "}
            <a href="https://www2.gov.bc.ca/gov/content?id=9B2A1A8E36EB4FDB98B0F577B5F64EFC">
              Records Transfer and Storage
            </a>{" "}
            page.
          </Typography>
          <Typography>
            Or{" "}
            <a href="https://www2.gov.bc.ca/gov/content?id=FE683E9D3E3F4CD19AA03BF979D4EC23 ">
              contact your GIM Specialists
            </a>
            .
          </Typography>
        </div>
      </main>
    </div>
  );
};

export default Landing;
