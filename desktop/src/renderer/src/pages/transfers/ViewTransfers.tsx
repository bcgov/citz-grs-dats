import { Grid2 as Grid, Stack, TextField, Typography } from "@mui/material";
import { LoginRequiredModal, Toast } from "@renderer/components";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../../App";
import {
  ConfirmDeletionModal,
  ConfirmReDownloadModal,
  TransfersGrid,
} from "@renderer/components/view-transfers";
import { Button } from "@bcgov/design-system-react-components";

type Transfer = {
  id: number;
  accession: string;
  application: string;
  status: string;
  transferDate: string; // Format YYYY/MM/DD
};

export const ViewTransfersPage = () => {
  const [api] = useState(window.api); // Preload scripts

  const { accessToken } = useContext(Context);

  /**
   * transfers is the original unfiltered state. We use filteredState to track the filtered
   * transfer list when a search query is made but we need the original state to go back to
   * when the search query is cleared.
   */
  const [searchQuery, setSearchQuery] = useState("");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);

  // Modals
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [showConfirmDeletionModal, setShowConfirmDeletionModal] =
    useState(false);
  const [showConfirmReDownloadModal, setShowConfirmReDownloadModal] =
    useState(false);

  const [downloadAccession, setDownloadAccession] = useState<string | null>(
    null
  );
  const [downloadApplication, setDownloadApplication] = useState<string | null>(
    null
  );
  const [deleteAccession, setDeleteAccession] = useState<string | null>(null);
  const [deleteApplication, setDeleteApplication] = useState<string | null>(
    null
  );

  const [loadTransfersSuccess, setLoadTransfersSuccess] = useState<
    boolean | null
  >(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean | null>(null);
  const [recentDownloadFilePath, setRecentDownloadFilePath] = useState("");

  const handleTransferDelete = (accession: string, application: string) => {
    setDeleteAccession(accession);
    setDeleteApplication(application);
    setShowConfirmDeletionModal(true);
  };

  const handleTransferDownload = (
    accession: string,
    application: string,
    previouslyDownloaded: boolean
  ) => {
    setDownloadAccession(accession);
    setDownloadApplication(application);
    if (previouslyDownloaded) setShowConfirmReDownloadModal(true);
  };

  useEffect(() => {
    if (!showConfirmReDownloadModal && downloadAccession && downloadApplication)
      handleDownloadTransferRequest();
  }, [downloadAccession, downloadApplication, showConfirmReDownloadModal]);

  useEffect(() => {
    if (loadTransfersSuccess === false) {
      // Failed to load transfers
      toast.error(Toast, {
        data: {
          success: false,
          title: "Failed to load transfers",
          message:
            "We were unable to load transfers. Please log out and try again.",
        },
      });
    }
  }, [loadTransfersSuccess]);

  useEffect(() => {
    if (deleteSuccess === true) {
      // Success
      toast.success(Toast, {
        data: {
          success: true,
          title: "File deleted",
          message: "The file has been deleted successfully.",
        },
      });
    } else if (deleteSuccess === false) {
      // Failed to delete transfer
      toast.error(Toast, {
        data: {
          success: false,
          title: "Deletion unsuccessful",
          message:
            "Deletion failed. Please re-log and try again or contact the GIM Branch at GIM@gov.bc.ca.",
        },
      });
    }
  }, [deleteSuccess]);

  useEffect(() => {
    if (downloadSuccess === true) {
      // Success
      toast.success(Toast, {
        data: {
          success: true,
          title: "Download complete!",
          message: `The file has been downloaded successfully to ${recentDownloadFilePath}`,
        },
      });
    } else if (downloadSuccess === false) {
      // Failed to download transfer
      toast.error(Toast, {
        data: {
          success: false,
          title: "Download unsuccessful",
          message:
            "Download failed. Please re-log and try again or contact the GIM Branch at GIM@gov.bc.ca.",
        },
      });
    }
  }, [downloadSuccess]);

  const handleFetchTransfers = async () => {
    if (!accessToken) return;
    setLoadTransfersSuccess(null);

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

      if (!response.ok) return setLoadTransfersSuccess(false);
      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        // Set transfers
        const fetchedTransfers = jsonResponse.data.transfers?.map(
          (t, index) => {
            return {
              id: index,
              accession: t.metadata.admin.accession,
              application: t.metadata.admin.application,
              status: t.status,
              transferDate: t.transferDate,
            };
          }
        );
        setTransfers(fetchedTransfers);
        setFilteredTransfers(fetchedTransfers);
      } else return setLoadTransfersSuccess(false);
    } catch (error) {
      console.error(error);
      setLoadTransfersSuccess(false);
    }
  };

  const handleDeleteTransferRequest = async () => {
    if (!accessToken) return;
    setDeleteSuccess(null);

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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accession: deleteAccession,
          application: deleteApplication,
        }),
      });

      if (!response.ok) return setDeleteSuccess(false);
      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        // Deletion successful
        setDeleteSuccess(true);

        // Update state
        setTransfers((prev) => {
          return prev.filter(
            (t) =>
              t.accession !== deleteAccession &&
              t.application !== deleteApplication
          );
        });
      } else return setDeleteSuccess(false);
    } catch (error) {
      console.error(error);
      setDeleteSuccess(false);
    }
  };

  const handleDownloadTransferRequest = async () => {
    if (!accessToken) return;
    setDownloadSuccess(null);

    // Request url
    const apiUrl = await api.getCurrentApiUrl();
    const requestUrl = `${apiUrl}/transfer/download`;

    // Make request
    try {
      console.log("Making download transfer request.");
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accession: downloadAccession,
          application: downloadApplication,
        }),
      });

      if (!response.ok) return setDownloadSuccess(false);
      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        // Download file
        const downloadURL = jsonResponse.data.url;

        // Update state
        setTransfers((prev) => {
          const updatedTransfers = prev.map((t) => {
            if (
              t.accession === downloadAccession &&
              t.application === downloadApplication
            ) {
              // Make edit to status
              return { ...t, status: "Downloaded" };
            }
            return t; // Return unchanged
          });
          return updatedTransfers;
        });

        // Send download request to the Main process
        window.electron.ipcRenderer.send("download-transfer", downloadURL);
      } else return setDownloadSuccess(false);
    } catch (error) {
      console.error(error);
      setDownloadSuccess(false);
    }
  };

  window.electron.ipcRenderer.on(
    "download-transfer-complete",
    (_event, filePath) => {
      if (downloadSuccess !== true) {
        setRecentDownloadFilePath(filePath);
        setDownloadSuccess(true);
      }
    }
  );

  window.electron.ipcRenderer.on("download-transfer-failed", () => {
    if (downloadSuccess !== false) setDownloadSuccess(false);
  });

  const handleSearch = () => {
    const lowerCaseQuery = searchQuery.toLowerCase();

    const filtered = transfers.filter(
      ({ accession, application, status, transferDate }) =>
        accession.toLowerCase().includes(lowerCaseQuery) ||
        application.toLowerCase().includes(lowerCaseQuery) ||
        status.toLowerCase().includes(lowerCaseQuery) ||
        transferDate.includes(searchQuery)
    );

    setFilteredTransfers(filtered);
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
          <Stack direction="row" spacing={1}>
            <TextField
              sx={{ width: "350px" }}
              size="small"
              placeholder="Search within"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onPress={handleSearch}>Search</Button>
          </Stack>
          <TransfersGrid
            rows={filteredTransfers}
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
