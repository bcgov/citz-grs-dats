import { Header } from "@bcgov/design-system-react-components";
import { Box, Button, Grid2 as Grid } from "@mui/material";
import { createContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { SideNav, Toast, VPNPopup } from "./components";
import { LeavePageModal } from "./components/LeavePageModal";
import {
  EdrmsInstructionsPage,
  FileListPage,
  HomePage,
  LanInstructionsPage,
  LanTransferPage,
  SendRecordsPage,
} from "./pages";
import { EdrmsTransferPage } from "./pages/transfers/EdrmsTransfer";

type AppContext = {
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
  const [currentPath, setCurrentPath] = useState("/");

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

  const handleIPStatusUpdate = async () => {
    const ipStatusOK = await api.checkIpRange();
    setShowVPNPopup(!ipStatusOK);
  };

  useEffect(() => {
    if (showVPNPopup) {
      toast.error(Toast, {
        data: {
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

  return (
    <Grid container sx={{ height: "100vh" }}>
      <VPNPopup open={showVPNPopup} />
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
          value={{ accessToken, currentPath, setCurrentPath, setProgressMade }}
        >
          <Box>
            {currentPath === "/" && <HomePage />}
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
          </Box>
        </Context.Provider>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar
          pauseOnHover
        />
      </Grid>
      <LeavePageModal
        open={leavePageModalOpen}
        onClose={() => setLeavePageModalOpen(false)}
        onConfirm={onConfirmLeavePage}
      />
    </Grid>
  );
}

export default App;
