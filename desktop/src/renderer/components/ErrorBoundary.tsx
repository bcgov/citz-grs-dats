import { Component, type ReactNode } from "react";
import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            bgcolor: "var(--bg)",
          }}
        >
          <Stack
            gap={3}
            alignItems="center"
            sx={{
              p: 6,
              maxWidth: 480,
              textAlign: "center",
              border: "1px solid var(--modal-border)",
              borderRadius: "4px",
              boxShadow: "0px 25.6px 57.6px 0px #00000038",
            }}
          >
            <ErrorOutline sx={{ fontSize: 48, color: "var(--error)" }} />
            <Typography variant="h3">Something went wrong</Typography>
            <Typography sx={{ color: "var(--text-secondary)" }}>
              {this.state.error?.message ?? "An unexpected error occurred."}
            </Typography>
            <Button
              variant="primary"
              onPress={this.handleReload}
              style={{ justifyContent: "center", padding: "8px 24px" }}
            >
              Reload Application
            </Button>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}
