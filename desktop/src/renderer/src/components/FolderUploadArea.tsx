import {
  UploadFile as UploadFileIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Toast } from "./Toast";

type Props = {
  folderPath?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (folderPath: string | null | undefined) => void;
  onDelete: () => void;
};

export const FolderUploadArea = ({
  folderPath,
  onChange,
  onDrop,
  onDelete,
}: Props) => {
  const [isInvalidFile, setIsInvalidFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];

      if (item.type === "") {
        setIsInvalidFile(false);
      } else {
        setIsInvalidFile(true);
      }
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    setIsInvalidFile(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setIsInvalidFile(false);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];

      if (item.type === "") {
        onDrop(e.dataTransfer.files[0].path);
      } else {
        toast.error(Toast, {
          data: {
            title: "Wrong file type",
            message: "File type not accepted. Please upload a folder.",
          },
        });
        onDrop(null);
      }
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the input element

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if the file is a directory (not possible directly via input)
    if (selectedFile.webkitRelativePath) {
      onChange(e);
    } else {
      toast.error(Toast, {
        data: {
          title: "Wrong file type",
          message: "File type not accepted. Please upload a folder.",
        },
      });

      e.target.value = "";
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    // Check if uploaded file is a folder and is not empty
    if (folderPath) {
      // TODO preload function to check if dir and empty
    }
  }, [folderPath]);

  return (
    <Box
      sx={{
        backgroundColor: isDragging
          ? isInvalidFile
            ? "var(--file_upload_area-bg-invalid)" // Light red for invalid file
            : "var(--file_upload_area-bg-valid)" // Light blue for valid file
          : "var(--file_upload_area-bg-default)", // Default background
        borderColor: isDragging
          ? isInvalidFile
            ? "var(--file_upload_area-border-invalid)" // Red for invalid file
            : "var(--file_upload_area-border-valid)" // Blue for valid file
          : "var(--file_upload_area-border-default)", // Grey for no dragging
        transition: "all 0.25s",
      }}
      height={"15rem"}
      border={"solid 1px"}
      onClick={() => {
        // TODO call preload selectDirectory
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Box
        sx={{
          height: "calc(100% - 8px)",
          display: "flex",
          alignItems: folderPath ? "start" : "center",
          justifyContent: folderPath ? "left" : "center",
        }}
      >
        {folderPath ? (
          <Stack
            direction="row"
            gap={2}
            sx={{
              margin: 2,
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--file_upload_area-bg-uploaded-file)",
              padding: "16px",
              minWidth: "400px",
            }}
          >
            <UploadFileIcon />
            <Stack gap={"4px"}>
              <Typography sx={{ width: "200px" }}>{folderPath}</Typography>
            </Stack>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Stack>
        ) : (
          <Stack
            gap={2}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <UploadFileIcon />
            <Typography>Choose a folder or drag and drop here</Typography>
            <Typography
              sx={{
                padding: "8px 16px",
                border:
                  "1px solid var(--file_upload_area-border-browse-button)",
                borderRadius: "5px",
                "&:hover": {
                  cursor: "pointer",
                },
              }}
            >
              Browse folders
            </Typography>
          </Stack>
        )}
      </Box>
      <input
        id="folder-input"
        type="file"
        ref={fileInputRef}
        style={{ width: 0 }}
        onChange={handleFileChange}
      />
    </Box>
  );
};
