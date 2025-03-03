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

  const { accessToken } = useContext(Context);

  // Modals
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [showConfirmDeletionModal, setShowConfirmDeletionModal] =
    useState(false);
  const [showConfirmReDownloadModal, setShowConfirmReDownloadModal] =
    useState(false);

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [currentAccession, setCurrentAccession] = useState<string | null>(null);
  const [currentApplication, setCurrentApplication] = useState<string | null>(
    null
  );

  const handleTransferDelete = (accession: string, application: string) => {
    setCurrentAccession(accession);
    setCurrentApplication(application);
    setShowConfirmDeletionModal(true);
  };

  const handleTransferDownload = (
    accession: string,
    application: string,
    previouslyDownloaded: boolean
  ) => {
    setCurrentAccession(accession);
    setCurrentApplication(application);
    if (previouslyDownloaded) setShowConfirmReDownloadModal(true);
    else handleDownloadTransferRequest();
  };

  const handleFailedToFetchTransfers = () => {
    toast.error(Toast, {
      data: {
        title: "Failed to load transfers",
        message:
          "We were unable to load transfers. Please log out and try again.",
      },
    });
  };

  const handleFailedToDeleteTransfer = () => {
    toast.error(Toast, {
      data: {
        title: "Deletion unsuccessful",
        message:
          "Deletion failed. Please re-log and try again or contact the GIM Branch at GIM@gov.bc.ca.",
      },
    });
  };

  const handleFailedToDownloadTransfer = () => {
    toast.error(Toast, {
      data: {
        title: "Download unsuccessful",
        message:
          "Download failed. Please re-log and try again or contact the GIM Branch at GIM@gov.bc.ca.",
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

      if (!response.ok) return handleFailedToFetchTransfers();
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
      } else return handleFailedToFetchTransfers();
    } catch (error) {
      console.error(error);
      handleFailedToFetchTransfers();
    }
  };

  const handleDeleteTransferRequest = async () => {
    if (!accessToken) return;

    // Request url
    const apiUrl = await api.getCurrentApiUrl();
    const requestUrl = `${apiUrl}/transfer`;

    // Make request
    try {
      console.log("Making delete transfer request.");
      const response = await fetch(requestUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          accession: currentAccession,
          application: currentApplication,
        }),
      });

      if (!response.ok) return handleFailedToDeleteTransfer();
      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        // Deletion successful
        toast.success(Toast, {
          data: {
            title: "File deleted",
            message: "The file has been deleted successfully.",
          },
        });
      } else return handleFailedToDeleteTransfer();
    } catch (error) {
      console.error(error);
      handleFailedToDeleteTransfer();
    }
  };

  const handleDownloadTransferRequest = async () => {
    if (!accessToken) return;

    // Request url
    const apiUrl = await api.getCurrentApiUrl();
    const requestUrl = `${apiUrl}/transfer/download`;

    // Make request
    try {
      console.log("Making download transfer request.");
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          accession: currentAccession,
          application: currentApplication,
        }),
      });

      if (!response.ok) return handleFailedToDownloadTransfer();
      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        // Download successful
        toast.success(Toast, {
          data: {
            title: "Download complete!",
            message: "The file has been downloaded successfully.",
          },
        });
      } else return handleFailedToDownloadTransfer();
    } catch (error) {
      console.error(error);
      handleFailedToDownloadTransfer();
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
