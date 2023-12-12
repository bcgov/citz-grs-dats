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
