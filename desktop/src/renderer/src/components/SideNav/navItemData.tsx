import {
  DescriptionOutlined as FileListIcon,
  DriveFileMoveOutlined as SendRecordsIcon,
  AnalyticsOutlined as ViewStatusIcon,
} from "@mui/icons-material";
import type { NavItemProps } from "./NavItem.d";

const navItemData: NavItemProps[] = [
  {
    path: "/file-list",
    label: "Create file list",
    icon: <FileListIcon sx={{ color: "var(--text-secondary)" }} />,
    role: "any",
  },
  {
    path: "/send-records",
    label: "Send records",
    icon: <SendRecordsIcon sx={{ color: "var(--text-secondary)" }} />,
    role: "any",
  },
  {
    path: "/view-transfers",
    label: "View status",
    icon: <ViewStatusIcon sx={{ color: "var(--text-secondary)" }} />,
    role: "Archivist",
  },
];

export default navItemData;
