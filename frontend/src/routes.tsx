// import React from "react";
// import { ReactElement } from "react";
// import ITransferFormData from "./types/Interfaces/ITransferFormData";

// const Dashboard = React.lazy(() => import("./views/Dashboard/Dashboard"));
// // const Transfers = React.lazy(() => import("./views/transfers/Transfers"));
// const Transfers = React.lazy(() => import("./views/Transfers/TransferList"));
// const Transfer = React.lazy(() => import("./views/Transfers/TransferEdit"));
// const UploadeDigitalFileListForm = React.lazy(
//   () => import("./views/UploadeDigitalFileList/UploadeDigitalFileListForm")
// );

// interface Route {
//   path: string;
//   exact?: boolean;
//   name: string;
//   element: ReactElement<any>;
// }
// interface EditTransferPageProps {
//   transferFormData: ITransferFormData;
//   onEditTransfer: (transferFormData: ITransferFormData) => void;
// }

// const routes: Route[] = [
//   { path: "/", exact: true, name: "Home", element: <div>Home</div> }, // Replace with your desired content
//   { path: "/dashboard", name: "Dashboard", element: <Dashboard /> },
//   { path: "/Transfers", name: "Transfers", element: <Transfers /> },
//   { path: "/Transfer/:transferId", name: "Transfer", element: <Transfer /> },
//   {
//     path: "/UploadDigitalFileList/UploadDigitalFileListForm",
//     name: "UploadDigitalFileList",
//     element: <UploadeDigitalFileListForm />,
//   },
//   // ... Define other routes similarly
// ];

// export default routes;
// pages
import Home from "./views/Home/Home";
import CreateDigitalFileList from "./views/CreateDigitalFileList/CreateDigitalFileList";
import SendRecords from "./views/SendRecords/SendRecords";
import TransferViewStatus from "./views/ViewTransferStatus/TransferViewStatus";

import TransferViewEdit from "./views/ViewTransferStatus/TransferViewEdit";

// import Dashboard from "./views/Dashboard/Dashboard";

// other
import { FC } from "react";

// interface
interface Route {
  key: string;
  title: string;
  path: string;
  enabled: boolean;
  component: FC<{}>;
}

export const routes: Array<Route> = [
  {
    key: "home-route",
    title: "Home",
    path: "/",
    enabled: true,
    component: Home,
  },
  {
    key: "create-Digital-File-List-route",
    title: "CreateDigitalFileList",
    path: "/CreateDigitalFileList",
    enabled: true,
    component: CreateDigitalFileList,
  },
  {
    key: "sendRecords-route",
    title: "SendRecords",
    path: "/SendRecords",
    enabled: true,
    component: SendRecords,
  },
  {
    key: "transfer-view-status-route",
    title: "TransferViewStatus",
    path: "/ViewTransferStatus",
    enabled: true,
    component: TransferViewStatus,
  },
  {
    key: "transfer-view-edit-route",
    title: "TransferViewEdit",
    path: "/TransferViewEdit/:transferId",
    enabled: true,
    component: TransferViewEdit,
  },
];
