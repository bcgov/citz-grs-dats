import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { bcGovTheme } from "./assets/themes/bcGovTheme";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TransferViewStatus from "./views/ViewTransferStatus/TransferStatusView";
import Landing from "./views/LandingPage/Landing";
import MyAppBar from "./components/layout/AppBar";
import Dashboard from "./views/Dashboard/Dashboard";
import CreateDigitalFileList from "./views/CreateDigitalFileList/CreateDigitalFileList";
import TransferViewEdit from "./views/ViewTransferStatus/TransferViewEdit";
import SendRecords from "./views/SendRecords/SendRecords";
import { SendRecordsLAN } from "./views/SendRecords/SendRecordsLAN";
import SendRecordsEDRMS from "./views/SendRecords/SendRecordsEDRMS";
import CreateDigitalFileListSplash from "./views/CreateDigitalFileList/SplashScreen";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={bcGovTheme}>
      <CssBaseline />
      <Router>
        <MyAppBar />
        <div style={{ margin: "0 10%" }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/create-intro"
              element={<CreateDigitalFileListSplash />}
            />
            <Route path="/create" element={<CreateDigitalFileList />} />
            <Route path="/send" element={<SendRecords />} />
            <Route path="/transfer-status" element={<TransferViewStatus />} />
            <Route path="/edit-transfer/:id" element={<TransferViewEdit />} />
            <Route path="/send-edrms" element={<SendRecordsEDRMS />} />
            <Route path="/send-lan" element={<SendRecordsLAN />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
