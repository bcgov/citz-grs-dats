import React, { Fragment, useEffect } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { bcGovTheme } from "./assets/themes/bcGovTheme";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import TransferViewStatus from "./views/ViewTransferStatus/TransferStatusView";
import Landing from "./views/LandingPage/Landing";
import MyAppBar from "./components/layout/AppBar";
import Dashboard from "./views/Dashboard/Dashboard";
import CreateDigitalFileList from "./views/CreateDigitalFileList/CreateDigitalFileList";
import TransferViewEdit from "./views/ViewTransferStatus/TransferViewEdit";
import SendRecords from "./views/SendRecords/SendRecords";
import { SendRecordsLAN } from "./views/SendRecords/SendRecordsLAN";
import PrivateRoute from "./auth/PrivateRoute";
import SendRecordsEDRMS from "./views/SendRecords/SendRecordsEDRMS";

//import { bcGovTheme } from "./assets/themes/bcGovTheme";


const App: React.FC = () => {
  return (
    <ThemeProvider theme={bcGovTheme}>
        <CssBaseline />
        <Router>
          <MyAppBar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateDigitalFileList />} />
              <Route path="/send" element={<SendRecords />} />
              <Route path="/transfer-status" element={<TransferViewStatus />} />
              <Route path="/edit-transfer/:id" element={<TransferViewEdit />} />
              <Route path="/send-edrms" element={<SendRecordsEDRMS />} />
              <Route path="/send-lan" element={<SendRecordsLAN />} />
            </Route>
          </Routes>
        </Router>
    </ThemeProvider>
  );
}


export default App;
