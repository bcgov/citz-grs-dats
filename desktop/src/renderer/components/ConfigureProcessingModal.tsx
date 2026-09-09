import { useCallback, useEffect, useState } from "react";
import { Button } from "@bcgov/design-system-react-components";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Config = {
  highWaterMark: number;
  concurrency: number;
  hashAlgorithms: string[];
  checksumMode: string;
  fingerprintSize: number;
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 480,
  bgcolor: "background.paper",
  border: "1px solid var(--modal-border)",
  borderRadius: "4px",
  boxShadow:
    "0px 25.6px 57.6px 0px #00000038, 0px 4.8px 14.4px 0px #0000002E",
};

const headerStyle = {
  display: "flex",
  flexDirection: "row",
  gap: 1,
  padding: "16px 24px",
  borderBottom: "1px solid var(--modal-border)",
};

const buttonBoxStyle = {
  display: "flex",
  justifyContent: "right",
  gap: 1,
  flexShrink: 0,
  borderTop: "1px solid var(--modal-border)",
  padding: 2,
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  height: "fit-content",
  padding: "8px 24px",
};

const innerButtonStyle = {
  justifyContent: "center",
  padding: "8px 16px",
};

const selectMenuProps = { sx: { zIndex: 10000 } };

const ALGORITHM_OPTIONS = [
  { value: "sha256", label: "SHA-256" },
  { value: "md5", label: "MD5" },
  { value: "sha1", label: "SHA-1" },
] as const;

export const ConfigureProcessingModal = ({ open, onClose }: Props) => {
  const [config, setConfig] = useState<Config>({
    highWaterMark: 524288,
    concurrency: 5,
    hashAlgorithms: ["md5", "sha256"],
    checksumMode: "full",
    fingerprintSize: 65536,
  });

  useEffect(() => {
    if (open) {
      window.api.getProcessingConfig().then((cfg) => {
        if (cfg) setConfig(cfg as Config);
      });
    }
  }, [open]);

  const handleSave = useCallback(async () => {
    await window.api.setProcessingConfig({
      highWaterMark: Number(config.highWaterMark),
      concurrency: Math.max(1, Math.min(16, Number(config.concurrency))),
      hashAlgorithms: config.hashAlgorithms,
      checksumMode: config.checksumMode,
      fingerprintSize: Number(config.fingerprintSize),
    });
    onClose();
  }, [config, onClose]);

  const handleAlgorithmToggle = useCallback((algorithm: string) => {
    setConfig((prev) => {
      const current = prev.hashAlgorithms;
      const next = current.includes(algorithm)
        ? current.filter((a) => a !== algorithm)
        : [...current, algorithm];
      if (next.length === 0) return prev;
      return { ...prev, hashAlgorithms: next };
    });
  }, []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      style={{ zIndex: "9999" }}
      disableAutoFocus
    >
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <SettingsIcon sx={{ color: "var(--text)", width: "20px" }} />
          <Typography variant="h3" sx={{ color: "var(--text)" }}>
            Configure Processing
          </Typography>
        </Box>

        <Box sx={contentStyle}>
          <FormControl fullWidth>
            <InputLabel>Checksum Type</InputLabel>
            <Select
              value={config.checksumMode}
              label="Checksum Type"
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  checksumMode: e.target.value,
                }))
              }
              MenuProps={selectMenuProps}
            >
              <MenuItem value="full">Full Checksum</MenuItem>
              <MenuItem value="fingerprint">Fingerprint</MenuItem>
            </Select>
            <FormHelperText>
              {config.checksumMode === "fingerprint"
                ? "Hashes first/last N bytes + file metadata. Faster for large files over network."
                : "Reads and hashes the entire file."}
            </FormHelperText>
          </FormControl>

          <FormControl fullWidth component="fieldset">
            <Typography
              variant="caption"
              sx={{ mb: 1, color: "rgba(0, 0, 0, 0.6)" }}
            >
              Hash Algorithms (at least one required)
            </Typography>
            <FormGroup>
              {ALGORITHM_OPTIONS.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  control={
                    <Checkbox
                      checked={config.hashAlgorithms.includes(opt.value)}
                      onChange={() => handleAlgorithmToggle(opt.value)}
                    />
                  }
                  label={opt.label}
                />
              ))}
            </FormGroup>
          </FormControl>

          {config.checksumMode === "fingerprint" && (
            <TextField
              label="Fingerprint Size (bytes)"
              type="number"
              value={config.fingerprintSize}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  fingerprintSize: Number(e.target.value),
                }))
              }
              inputProps={{ min: 1024, max: 1048576 }}
              helperText="Bytes to read from start and end of file. Default: 65536 (64KB)"
              fullWidth
            />
          )}

          <TextField
            label="Buffer Size (bytes)"
            type="number"
            value={config.highWaterMark}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                highWaterMark: Number(e.target.value),
              }))
            }
            helperText="Read chunk size. Default: 524288 (512KB)"
            fullWidth
          />

          <TextField
            label="Concurrency"
            type="number"
            value={config.concurrency}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                concurrency: Number(e.target.value),
              }))
            }
            inputProps={{ min: 1, max: 16 }}
            helperText="Files processed in parallel per directory (1-16). Default: 5"
            fullWidth
          />
        </Box>

        <Box sx={buttonBoxStyle}>
          <Button
            variant="tertiary"
            style={innerButtonStyle}
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            style={innerButtonStyle}
            onPress={handleSave}
          >
            Save
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
};
