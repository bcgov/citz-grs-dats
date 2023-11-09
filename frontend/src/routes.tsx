import React from "react";
import { ReactElement } from "react";
import ITransferFormData from "./types/Interfaces/ITransferFormData";

const Dashboard = React.lazy(() => import("./views/Dashboard/Dashboard"));
// const Transfers = React.lazy(() => import("./views/transfers/Transfers"));
const Transfers = React.lazy(() => import("./views/Transfers/TransferList"));
const Transfer = React.lazy(() => import("./views/Transfers/TransferEdit"));
const UploadeDigitalFileListForm = React.lazy(
  () => import("./views/UploadeDigitalFileList/UploadeDigitalFileListForm")
);

interface Route {
  path: string;
  exact?: boolean;
  name: string;
  element: ReactElement<any>;
}
interface EditTransferPageProps {
  transferFormData: ITransferFormData;
  onEditTransfer: (transferFormData: ITransferFormData) => void;
}

const routes: Route[] = [
  { path: "/", exact: true, name: "Home", element: <div>Home</div> }, // Replace with your desired content
  { path: "/dashboard", name: "Dashboard", element: <Dashboard /> },
  { path: "/Transfers", name: "Transfers", element: <Transfers /> },
  { path: "/Transfer/:transferId", name: "Transfer", element: <Transfer /> },
  {
    path: "/UploadDigitalFileList/UploadDigitalFileListForm",
    name: "UploadDigitalFileList",
    element: <UploadeDigitalFileListForm />,
  },
  // ... Define other routes similarly
];

export default routes;
