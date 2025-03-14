import { Header } from "@bcgov/design-system-react-components";
import { Box, Button, Grid2 as Grid } from "@mui/material";
import { createContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  CloseApplicationModal,
  ReleaseNotesModal,
  SideNav,
  Toast,
  VPNPopup,
} from "./components";
import { LeavePageModal } from "./components/LeavePageModal";
import {
  EdrmsInstructionsPage,
  EdrmsTransferPage,
  FileListInstructionsPage,
  FileListPage,
  HomePage,
  LanInstructionsPage,
  LanTransferPage,
  SendRecordsPage,
  ViewTransfersPage,
} from "./pages";
import { useAppCloseHandler } from "@/hooks";

type AppContext = {
  idToken?: string;
  accessToken?: string;
  currentPath: string;
  setCurrentPath:
    | React.Dispatch<React.SetStateAction<string>>
    | ((value: string) => void);
  setProgressMade:
    | React.Dispatch<React.SetStateAction<boolean>>
    | ((value: boolean) => void);
};

export const Context = createContext<AppContext>({
  currentPath: "/",
  setCurrentPath: () => {},
  setProgressMade: () => {},
});

function App(): JSX.Element {
  const [api] = useState(window.api); // Preload scripts
  const [showVPNPopup, setShowVPNPopup] = useState<boolean>(false);
  const [leavePageModalOpen, setLeavePageModalOpen] = useState(false);
  const [releaseNotesModalOpen, setReleaseNotesModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");

  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [releaseNotes, setReleaseNotes] = useState<Record<
    string,
    string
  > | null>(null);

  const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

  // Track when progress has been made in the app so we can warn the
  // user about navigating away and losing progress.
  const [progressMade, setProgressMade] = useState(false);

  // Authentication state
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [idToken, setIdToken] = useState<string | undefined>(undefined);

  const onConfirmLeavePage = () => {
    setLeavePageModalOpen(false);
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchReleaseNotes = async () => {
      const notes = await api.getReleaseNotes();
      setReleaseNotes(notes);
    };
    const fetchAppVersion = async () => {
      const version = await api.getCurrentAppVersion();
      setAppVersion(version);
    };

    fetchReleaseNotes();
    fetchAppVersion();
  }, []);

  useEffect(() => {
    // Show release notes
    if (appVersion && releaseNotes) {
      setReleaseNotesModalOpen(true);
    }
  }, [appVersion, releaseNotes]);

  useEffect(() => {
    // Handle "auth-success" message from main process
    // Triggered upon successful login
    window.electron.ipcRenderer.on("auth-success", (_, tokens) => {
      setAccessToken(tokens.accessToken);
      setIdToken(tokens.idToken);
    });

    // Handle "token-refresh-success" message from main process
    // Triggered upon successful refresh of tokens
    window.electron.ipcRenderer.on("token-refresh-success", (_, tokens) =>
      setAccessToken(tokens.accessToken)
    );

    // Handle "auth-logout" message from main process
    // Triggered upon logout
    window.electron.ipcRenderer.on("auth-logout", () =>
      setAccessToken(undefined)
    );

    // Alert when auth token copied.
    window.electron.ipcRenderer.on("auth-token-copied", (_, obj) =>
      alert(obj.message)
    );

    // Cleanup
    return () => {
      window.electron.ipcRenderer.removeAllListeners("auth-success");
      window.electron.ipcRenderer.removeAllListeners("auth-logout");
      window.electron.ipcRenderer.removeAllListeners("token-refresh-success");
      window.electron.ipcRenderer.removeAllListeners("auth-token-copied");
    };
  }, []);

  const handleCloseReleaseNotesModal = async () => {
    await api.updateViewedReleaseVersion();
    setReleaseNotesModalOpen(false);
  };

  const handleIPStatusUpdate = async () => {
    const ipStatusOK = await api.checkIpRange();
    setShowVPNPopup(!ipStatusOK);
  };

  useEffect(() => {
    if (showVPNPopup) {
      toast.error(Toast, {
        data: {
          success: false,
          title: "DATS is unavailable",
          message: "Please connect to the BC Gov network or VPN to resume.",
        },
      });
    }
  }, [showVPNPopup]);

  useEffect(() => {
    // Check for VPN or gov Network use on load, and every 5 seconds
    handleIPStatusUpdate();
    const interval = setInterval(handleIPStatusUpdate, 5 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Reset progress made when route is changed
  useEffect(() => {
    api.workers.shutdown();
    setProgressMade(false);
  }, [currentPath]);

  return (
    <Grid container sx={{ height: "100vh" }}>
      <VPNPopup open={showVPNPopup} />
      <CloseApplicationModal
        open={showClosePrompt}
        onClose={cancelClose}
        onConfirm={confirmClose}
      />
      <LeavePageModal
        open={leavePageModalOpen}
        onClose={() => setLeavePageModalOpen(false)}
        onConfirm={onConfirmLeavePage}
      />
      <ReleaseNotesModal
        open={releaseNotesModalOpen}
        onClose={handleCloseReleaseNotesModal}
        releaseNotes={releaseNotes}
        appVersion={appVersion}
      />
      <Grid size={2}>
        <SideNav
          accessToken={accessToken}
          idToken={idToken}
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          progressMade={progressMade}
        />
      </Grid>
      <Grid size={10}>
        <Header
          title="Digital Archives Transfer Service"
          logoLinkElement={
            <Button onClick={() => setLeavePageModalOpen(true)} />
          }
        />
        <Context.Provider
          value={{
            idToken,
            accessToken,
            currentPath,
            setCurrentPath,
            setProgressMade,
          }}
        >
          <Box>
            {currentPath === "/" && <HomePage />}
            {currentPath === "/file-list/instructions" && (
              <FileListInstructionsPage />
            )}
            {currentPath === "/file-list" && <FileListPage />}
            {currentPath === "/send-records" && <SendRecordsPage />}
            {currentPath === "/send-records/lan" && <LanTransferPage />}
            {currentPath === "/send-records/edrms" && <EdrmsTransferPage />}
            {currentPath === "/send-records/lan/instructions" && (
              <LanInstructionsPage />
            )}
            {currentPath === "/send-records/edrms/instructions" && (
              <EdrmsInstructionsPage />
            )}
            {currentPath === "/view-transfers" && <ViewTransfersPage />}
          </Box>
        </Context.Provider>
        <ToastContainer
          position="bottom-left"
          autoClose={4000}
          hideProgressBar
          pauseOnHover
        />
      </Grid>
    </Grid>
  );
}

export default App;
