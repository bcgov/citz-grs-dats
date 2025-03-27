import { Stack, Typography } from "@mui/material";
import { ArrowForward as ArrowRightIcon } from "@mui/icons-material";

type Props = {
  items: string[];
  currentIndex: number;
};

export const Stepper = ({ items, currentIndex }: Props): JSX.Element => {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {items.map((item, index) => (
        <Stack key={`${index}-${item}`} direction="row" alignItems="center">
          {/* Item text */}
          <Typography
            sx={{
              background:
                currentIndex === index
                  ? "#D8EAFD"
                  : currentIndex > index
                  ? "#EDEBE9"
                  : "#F3F2F1",
              color:
                currentIndex < index || currentIndex === index
                  ? "#2D2D2D"
                  : "#9F9D9C",
              border: `1px solid ${
                currentIndex > index ? "#D8D8D8" : "#353433"
              }`,
              borderRadius: "12px",
              padding: "2px 12px",
              fontSize: "12px",
              fontWeight: 400,
            }}
          >
            {item}
          </Typography>

          {/* Arrow icon */}
          {index < items.length - 1 && (
            <ArrowRightIcon
              sx={{
                marginLeft: 1,
                fontSize: "1rem",
                color: "#9F9D9C",
              }}
            />
          )}
        </Stack>
      ))}
    </Stack>
  );
};
