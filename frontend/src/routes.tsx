import Home from "./views/home/home";
import CreateDigitalFileList from "./views/CreateDigitalFileList/CreateDigitalFileList";
import SendRecords from "./views/SendRecords/SendRecords";
import TransferViewStatus from "./views/ViewTransferStatus/ViewTransferStatus";

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
  requiresAuth: boolean;
  component: FC<{}>;
}

export const routes: Array<Route> = [
  {
    key: "home-route",
    title: "Home",
    path: "/",
    enabled: true,
    requiresAuth: false,
    component: Home,
  },
  {
    key: "create-Digital-File-List-route",
    title: "CreateDigitalFileList",
    path: "/CreateDigitalFileList",
    requiresAuth: false,
    enabled: true,
    component: CreateDigitalFileList,
  },
  {
    key: "sendRecords-route",
    title: "SendRecords",
    path: "/SendRecords",
    requiresAuth: true,
    enabled: true,
    component: SendRecords,
  },
  {
    key: "transfer-view-status-route",
    title: "TransferViewStatus",
    path: "/ViewTransferStatus",
    requiresAuth: true,
    enabled: true,
    component: TransferViewStatus,
  },
  {
    key: "transfer-view-edit-route",
    title: "TransferViewEdit",
    path: "/TransferViewEdit/:transferId",
    requiresAuth: true,
    enabled: true,
    component: TransferViewEdit,
  },
];
