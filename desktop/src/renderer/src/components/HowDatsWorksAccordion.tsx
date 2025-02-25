import * as React from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion, { type AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  type AccordionSummaryProps,
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { Link, Stack } from "@mui/material";
import { Instruction } from "./Instruction";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: "rotate(90deg)",
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles("dark", {
    backgroundColor: "rgba(255, 255, 255, .05)",
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export default function HomeDatsWorksAccordion() {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  return (
    <Accordion
      expanded={expanded === "panel1"}
      onChange={handleChange("panel1")}
    >
      <AccordionSummary
        aria-controls="how-records-transfer-works-accordion"
        id="panel1d-header"
      >
        <Typography component="span">How records transfer works</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack gap={2}>
          <Typography>
            These are the main steps to transfer FR records to the archives:
          </Typography>

          <Instruction
            num={1}
            instruction="Complete the Transfer Form"
            required={null}
            desc={
              <Typography sx={{ fontSize: "0.8em" }}>
                Fill in section 1 of the{" "}
                <Link
                  href="https://www2.gov.bc.ca/assets/gov/british-columbians-our-governments/services-policies-for-government/information-management-technology/records-management/transfer-storage/ars653.pdf?forcedownload=true"
                  target="_blank"
                >
                  Transfer Form (ARS 617)
                </Link>{" "}
                to communicate your intent to transfer FR records to the Digital
                Archives.
              </Typography>
            }
          />

          <Instruction
            num={2}
            instruction="Create file list"
            required={null}
            desc={
              <Typography sx={{ fontSize: "0.8em" }}>
                For records on a LAN drive, use DATS to create a Digital File
                List (ARS 662). For records in EDRMS CM9, use that application
                to create a file list as per the{" "}
                <Link
                  href="https://intranet.gov.bc.ca/thehub/ocio/cirmo/grs/grs-learning"
                  target="_blank"
                >
                  GIM Learning page
                </Link>
                . For records in other systems{" "}
                <Link
                  href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/records-contacts"
                  target="_blank"
                >
                  contact your GIM Specialists
                </Link>
                .
              </Typography>
            }
          />

          <Instruction
            num={3}
            instruction="Request a review"
            required={null}
            desc="Follow the steps in the Transfer Form (ARS 617) to request a quality assurance review from your GIM Specialists. This ensures the archives only contains high quality records and reduces."
          />

          <Instruction
            num={4}
            instruction="Send records"
            required={null}
            desc="Use DATS to securely send the digital FR records to the Digital Archives as evidence."
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
