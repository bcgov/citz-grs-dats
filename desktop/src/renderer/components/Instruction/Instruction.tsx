import { Box, Stack, Typography } from "@mui/material";
import type { InstructionProps } from "./Instruction.d";

export const Instruction = ({
  num,
  instruction,
  required,
  desc,
}: InstructionProps) => {
  return (
    <Stack direction="row" gap={2}>
      <Box
        sx={{
          padding: "1px 9px",
          borderRadius: "50%",
          background: "#D8EAFD",
          height: "fit-content",
          fontSize: "14px",
        }}
      >
        {num}
      </Box>
      <Stack gap={1}>
        <Typography sx={{ fontSize: "16px" }}>
          <b>{instruction}</b>{" "}
          {required !== null && `(${required ? "required" : "optional"})`}
        </Typography>
        {desc && typeof desc === "string" ? (
          <Typography sx={{ fontSize: "16px" }}>{desc}</Typography>
        ) : (
          desc
        )}
      </Stack>
    </Stack>
  );
};
