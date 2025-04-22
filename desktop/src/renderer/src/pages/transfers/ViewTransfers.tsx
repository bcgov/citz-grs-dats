import { useAuth } from "@/hooks";
import { Button, Switch } from "@bcgov/design-system-react-components";
import { Grid2 as Grid, Stack, TextField, Typography } from "@mui/material";
import { LoginRequiredModal, Toast } from "@renderer/components";
import {
  ConfirmDeletionModal,
  ConfirmReDownloadModal,
  TransfersGrid,
} from "@renderer/components/view-transfers";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Transfer = {
  id: number;
  accession: string;
  application: string;
  status: string;
  transferDate: string; // Format YYYY/MM/DD
  processedBy?: string;
  processedOn?: string;
};

export const ViewTransfersPage = () => {
  const [api] = useState(window.api); // Preload scripts

  const { accessToken } = useAuth();

  /**
   * transfers is the original unfiltered state. We use filteredState to track the filtered
   * transfer list when a search query is made but we need the original state to go back to
   * when the search query is cleared.
   */
  const [searchQuery, setSearchQuery] = useState("");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);
  const [deletedTransfersOnly, setDeletedTransfersOnly] = useState(false);

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
  const [preserveAccession, setPreserveAccession] = useState<string | null>(
    null
  );
  const [preserveApplication, setPreserveApplication] = useState<string | null>(
    null
  );

  const [loadTransfersSuccess, setLoadTransfersSuccess] = useState<
    boolean | null
  >(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean | null>(null);
  const [preserveSuccess, setPreserveSuccess] = useState<boolean | null>(null);
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

  const handleTransferPreserve = (accession: string, application: string) => {
    setPreserveAccession(accession);
    setPreserveApplication(application);
  };

  useEffect(() => {
    if (preserveAccession && preserveApplication)
      handlePreserveTransferRequest();
  }, [preserveAccession, preserveApplication]);

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
          message:
            "The file has been deleted successfully. A stub will remain in DATS to prevent duplicate transfers. See ARIS for the official status.",
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

  useEffect(() => {
    if (preserveSuccess === true) {
      // Success
      toast.success(Toast, {
        data: {
          success: true,
          title: "Preserve complete!",
          message: "The file has been preserved to LibSafe successfully.",
        },
      });
    } else if (preserveSuccess === false) {
      // Failed to preserve transfer
      toast.error(Toast, {
        data: {
          success: false,
          title: "Preserve unsuccessful",
          message:
            "Preserve failed. Please re-log and try again or contact the GIM Branch at GIM@gov.bc.ca.",
        },
      });
    }
  }, [preserveSuccess]);

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
              processedBy: t.processedBy,
              processedOn: t.processedOn,
            };
          }
        );
        setTransfers(fetchedTransfers);
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
          return prev.map((t) => {
            if (
              t.accession === deleteAccession &&
              t.application === deleteApplication
            ) {
              t.status = "Transfer deleted";
            }
            return t;
          });
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
              return {
                ...t,
                status:
                  t.status === "Preserved"
                    ? "Downloaded & Preserved"
                    : "Downloaded",
              };
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

  const handlePreserveTransferRequest = async () => {
    if (!accessToken) return;
    setPreserveSuccess(null);

    toast.success(Toast, {
      data: {
        success: true,
        title: "Starting preserve",
        message:
          "Wait a few moments while we start the preservation process...",
      },
    });

    // Request url
    const apiUrl = await api.getCurrentApiUrl();
    const requestUrl = `${apiUrl}/transfer/preserve`;

    // Make request
    try {
      console.log("Making preserve transfer request.");
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accession: preserveAccession,
          application: preserveApplication,
        }),
      });

      if (!response.ok) return setPreserveSuccess(false);
      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        // Preserve successful
        setPreserveSuccess(true);

        // Update state
        setTransfers((prev) => {
          const updatedTransfers = prev.map((t) => {
            if (
              t.accession === preserveAccession &&
              t.application === preserveApplication
            ) {
              // Make edit to status
              return {
                ...t,
                status:
                  t.status === "Downloaded"
                    ? "Downloaded & Preserved"
                    : "Preserved",
              };
            }
            return t; // Return unchanged
          });
          return updatedTransfers;
        });
      } else return setPreserveSuccess(false);
    } catch (error) {
      console.error(error);
      setPreserveSuccess(false);
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

    if (deletedTransfersOnly)
      setFilteredTransfers(
        filtered.filter((t) => t.status === "Transfer deleted")
      );
    else
      setFilteredTransfers(
        filtered.filter((t) => t.status !== "Transfer deleted")
      );
  };

  useEffect(() => {
    if (deletedTransfersOnly)
      setFilteredTransfers(
        transfers.filter((t) => t.status === "Transfer deleted")
      );
    else
      setFilteredTransfers(
        transfers.filter((t) => t.status !== "Transfer deleted")
      );
  }, [transfers, deletedTransfersOnly]);

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
              <TextField
                sx={{ width: "350px" }}
                size="small"
                placeholder="Search within"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onPress={handleSearch}>Search</Button>
            </Stack>
            <Switch
              isSelected={deletedTransfersOnly}
              onChange={setDeletedTransfersOnly}
            >
              Deleted transfers only
            </Switch>
          </div>
          <TransfersGrid
            rows={filteredTransfers}
            onTransferDelete={handleTransferDelete}
            onTransferDownload={handleTransferDownload}
            onTransferPreserve={handleTransferPreserve}
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
