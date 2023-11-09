import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
} from "@coreui/icons";
import { CNavGroup, CNavItem, CNavTitle } from "@coreui/react";

interface NavItem {
  component: React.FunctionComponent<any>;
  name: string;
  to?: string;
  icon?: JSX.Element;
  badge?: {
    color: string;
    text: string;
  };
}

const _nav: NavItem[] = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/dashboard",
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: "info",
      text: "NEW",
    },
  },
  {
    component: CNavTitle,
    name: "Theme",
  },
  {
    component: CNavItem,
    name: "Transfers",
    to: "/Transfers",
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  // Add more items as needed
];

export default _nav;
