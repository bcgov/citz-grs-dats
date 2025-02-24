import { Box, Stack, Typography } from "@mui/material";

type Props = {
  num: number;
  instruction: string;
  required: boolean;
  tip?: string;
};

export const Instruction = ({ num, instruction, required, tip }: Props) => {
  return (
    <Stack direction="row" gap={2}>
      <Box
        sx={{
          padding: "1px 9px",
          borderRadius: "50%",
          background: "#D8EAFD",
          height: "fit-content",
        }}
      >
        {num}
      </Box>
      <Stack gap={1} sx={{ marginTop: "3px" }}>
        <Typography sx={{ fontSize: "0.8em" }}>
          <b>{instruction}</b> ({required ? "required" : "optional"})
        </Typography>
        {tip && <Typography sx={{ fontSize: "0.8em" }}>Tip: {tip}</Typography>}
      </Stack>
    </Stack>
  );
};
