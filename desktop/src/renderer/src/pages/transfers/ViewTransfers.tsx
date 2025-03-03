import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import { LoginRequiredModal, Toast } from "@renderer/components";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../../App";
import {
  ConfirmDeletionModal,
  ConfirmReDownloadModal,
  TransfersGrid,
} from "@renderer/components/view-transfers";

type Transfer = {
  id: number;
  accession: string;
  application: string;
  status: string;
  transferDate: string;
};

export const ViewTransfersPage = () => {
  const [api] = useState(window.api); // Preload scripts

  const { idToken, accessToken } = useContext(Context);

  const handleLogout = async () => await api.sso.logout(idToken);

  // Modals
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [showConfirmDeletionModal, setShowConfirmDeletionModal] =
    useState(false);
  const [showConfirmReDownloadModal, setShowConfirmReDownloadModal] =
    useState(false);

  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const handleTransferDelete = (accession: string, application: string) => {
    // TBD
  };

  const handleTransferDownload = (
    accession: string,
    application: string,
    previouslyDownloaded: boolean
  ) => {
    // TBD
  };

  const handleFailedToFetchTransfers = () => {
    toast.success(Toast, {
      data: {
        title: "Failed to load transfers",
        message:
          "We were unable to load transfers. Please log out and try again.",
      },
    });
  };

  const handleFailedToDeleteTransfer = () => {
    toast.success(Toast, {
      data: {
        title: "Failed to delete transfer",
        message:
          "We were unable to delete the transfer. Please log out and try again.",
      },
    });
  };

  const handleFailedToDownloadTransfers = () => {
    toast.success(Toast, {
      data: {
        title: "Failed to download transfer",
        message:
          "We were unable to download the transfer. Please log out and try again.",
      },
    });
  };

  const handleFetchTransfers = async () => {
    if (!accessToken) return;

    // Request url
    const apiUrl = await api.getCurrentApiUrl();
    const requestUrl = `${apiUrl}/transfer`;

    // Make request
    try {
      console.log("Making get transfers request.");
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) handleFailedToFetchTransfers();
      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        // Set transfers
        const fetchedTransfers = jsonResponse.transfers.map((t, index) => {
          return {
            id: index,
            accession: t.metadata.admin.accession,
            application: t.metadata.admin.application,
            status: t.status,
            transferDate: t.transferDate,
          };
        });
        setTransfers(fetchedTransfers);
      } else handleFailedToFetchTransfers();
    } catch (error) {
      console.error(error);
      handleFailedToFetchTransfers();
    }
  };

  useEffect(() => {
    // Fetch transfers on mount
    handleFetchTransfers();
  }, []);

  return (
    <Grid container sx={{ paddingBottom: "20px" }}>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack gap={2}>
          <Typography variant="h2">View transfer status</Typography>
          <TransfersGrid
            rows={transfers}
            onTransferDelete={handleTransferDelete}
            onTransferDownload={handleTransferDownload}
          />
          <ConfirmDeletionModal
            open={showConfirmDeletionModal}
            onClose={() => setShowConfirmDeletionModal(false)}
            onConfirm={() => {
              setShowConfirmDeletionModal(false);
              if (!accessToken) {
                // Prompt user to login
                setShowLoginRequiredModal(true);
              } else handleDeleteTransferRequest();
            }}
          />
          <ConfirmReDownloadModal
            open={showConfirmReDownloadModal}
            onClose={() => setShowConfirmReDownloadModal(false)}
            onConfirm={() => {
              setShowConfirmReDownloadModal(false);
              if (!accessToken) {
                // Prompt user to login
                setShowLoginRequiredModal(true);
              } else handleDownloadTransferRequest();
            }}
          />
          <LoginRequiredModal
            open={showLoginRequiredModal}
            onClose={() => setShowLoginRequiredModal(false)}
            onConfirm={() => {
              setShowLoginRequiredModal(false);
              api.sso.startLoginProcess();
            }}
          />
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
