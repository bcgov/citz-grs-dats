import { StatusCell } from "./StatusCell";

type Props = {
  bufferProgress: number;
  folderPath: string;
};

const cellStyles = {
  border: "2px solid var(--data-grid-border)",
  padding: "7px 12px",
};

export const ConfirmationTable = ({ bufferProgress, folderPath }: Props) => {
  return (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th
            style={{
              ...cellStyles,
              textAlign: "left",
              fontWeight: 700,
            }}
          >
            Status
          </th>
          <th
            style={{
              ...cellStyles,
              textAlign: "left",
              fontWeight: 700,
            }}
          >
            Folder path
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={cellStyles}>
            <StatusCell bufferProgress={bufferProgress} />
          </td>
          <td style={cellStyles}>{folderPath}</td>
        </tr>
      </tbody>
    </table>
  );
};
