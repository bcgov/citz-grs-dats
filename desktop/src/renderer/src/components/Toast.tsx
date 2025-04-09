import { Box, Stack, Typography } from "@mui/material";
import type { ToastContentProps } from "react-toastify";
import { ToastSuccessIcon } from "./ToastSuccessIcon";
import { ToastErrorIcon } from "./ToastErrorIcon";

/**
 * Example usage (Calling test will make the toast appear):
 * 
  import { Toast } from "@renderer/components/Toast";
  import { toast } from "react-toastify";

  const test = () => {
    toast.error(Toast, {
      data: {
        title: "Wrong file type",
        message: "File type not accepted. Please upload an .xlsx file.",
      },
    });
  };
 */

export const Toast = ({
  data,
}: ToastContentProps<{ title: string; message: string; success: boolean }>) => {
  return (
    <Stack direction="row" spacing={1}>
      <Box sx={{ width: "20px" }}>
        {data.success ? <ToastSuccessIcon /> : <ToastErrorIcon />}
      </Box>
      <Stack>
        <Typography sx={{ fontSize: "16px", fontWeight: 700 }}>
          {data.title}
        </Typography>
        <Typography>{data.message}</Typography>
      </Stack>
    </Stack>
  );
};
