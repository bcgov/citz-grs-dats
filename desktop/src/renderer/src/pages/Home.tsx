import {
  Box,
  Stack,
  Typography,
  useTheme,
  Grid2 as Grid,
  Link,
} from "@mui/material";
import { ListAlt as ListIcon } from "@mui/icons-material";
import type { ReactNode } from "react";
import { Button } from "@bcgov/design-system-react-components";
import HomeDatsWorksAccordion from "@renderer/components/HowDatsWorksAccordion";

export const HomePage = () => {
  const theme = useTheme();

  type PageLinkProps = {
    title: string;
    icon: ReactNode;
    desc: string;
    buttonText: string;
    pageRoute: string;
  };

  const PageLinkCard = ({
    title,
    icon,
    desc,
    buttonText,
    pageRoute,
  }: PageLinkProps) => {
    return (
      <Stack gap={2} sx={{ padding: "16px", background: "#FAF9F8" }}>
        <Stack direction="row" gap={1} sx={{ alignItems: "center" }}>
          {icon}
          <Typography variant="h4">{title}</Typography>
        </Stack>
        <Typography sx={{ fontSize: "0.9em" }}>{desc}</Typography>
        <Link href={pageRoute}>
          <Button variant="primary">{buttonText}</Button>
        </Link>
      </Stack>
    );
  };

  return (
    <Grid container>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack
          sx={{
            padding: 4,
            flexShrink: 0,
            background: `${theme.palette.primary}`,
            marginBottom: 3,
            marginTop: "-15px",
          }}
          gap={3}
        >
          <Typography variant="h1" sx={{ fontWeight: 600, color: "#474543" }}>
            Welcome to DATS
          </Typography>
          <Typography variant="h3">
            Digital Archives Transfer Service
          </Typography>

          <Box>
            <Typography>
              The Digital Archives Transfer Service (DATS) is a secure, evidence
              handling application that helps you:
            </Typography>
            <ul>
              <li>
                send your Full Retention (FR) archival records to the Digital
                Archives; and
              </li>
              <li>
                create digital file lists that include checksums and metadata.
              </li>
            </ul>
          </Box>

          <Typography sx={{ fontStyle: "italic" }}>
            To use DATS you must be connected to the network via VPN and logged
            into the DATS Application.
          </Typography>

          <PageLinkCard
            title="Create file list"
            icon={<ListIcon />}
            buttonText="Create file list"
            desc="Use DATS to create a Digital File List (ARS 662). A digital file list is required to transfer records to the Digital Archives from a LAN drive."
            pageRoute="/file-list/instructions"
          />

          <PageLinkCard
            title="Transfer records"
            icon={
              <img
                src="/src/assets/transfer-records.svg"
                alt="Transfer Records"
              />
            }
            buttonText="Send records"
            desc="Use DATS to securely transfer your digital FR records to the Digital Archives from either a LAN Drive or EDRMS Content Manager v.9.2."
            pageRoute="/send-records"
          />

          <HomeDatsWorksAccordion />

          <Typography>
            If you want to learn more about the process,{" "}
            <Link
              href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/records-contacts"
              target="_blank"
            >
              contact your GIM Specialists
            </Link>{" "}
            or check out{" "}
            <Link
              href="https://intranet.gov.bc.ca/thehub/ocio/cirmo/grs/grs-learning"
              target="_blank"
            >
              GIM Learning
            </Link>
            .
          </Typography>
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
