import React, { useState, useEffect } from "react";
import { Box, Alert } from "@mui/material";
import { WEBSOCKET_URL } from "../types/constants";

const HealthCheck: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      setError(null); // Connection successful, no error
    };

    ws.onerror = (event) => {
      setError("Failed to connect to the WebSocket server.");
    };

    ws.onclose = () => {
      if (error === null) {
        setError("WebSocket connection closed unexpectedly.");
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <Box mt={4}>{error ? <Alert severity="error">{error}</Alert> : null}</Box>
  );
};

export default HealthCheck;
