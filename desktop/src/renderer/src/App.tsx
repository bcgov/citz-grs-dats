import {
  AuthProvider,
  NavigateProvider,
  useAppCloseHandler,
  useReleaseNotes,
} from "@/hooks";
import { HashRouter } from "react-router";
import { CloseApplicationModal, Layout } from "./components";
import { Routes } from "./routes";
import { VPNMonitor } from "./utilities";

function App(): JSX.Element {
  const { ReleaseNotesModal } = useReleaseNotes();

  const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

  return (
    <>
      <VPNMonitor>
        <AuthProvider>
          <HashRouter>
            <NavigateProvider>
              <Layout>
                <Routes />
              </Layout>
              <ReleaseNotesModal />
            </NavigateProvider>
          </HashRouter>
        </AuthProvider>
      </VPNMonitor>
      <CloseApplicationModal
        open={showClosePrompt}
        onClose={cancelClose}
        onConfirm={confirmClose}
      />
    </>
  );
}

export default App;
