import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  num: number;
  instruction: string;
  required: boolean | null;
  desc?: string | ReactNode;
};

export const Instruction = ({ num, instruction, required, desc }: Props) => {
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
          <b>{instruction}</b>{" "}
          {required !== null && `(${required ? "required" : "optional"})`}
        </Typography>
        {desc && typeof desc === "string" ? (
          <Typography sx={{ fontSize: "0.8em" }}>{desc}</Typography>
        ) : (
          desc
        )}
      </Stack>
    </Stack>
  );
};
