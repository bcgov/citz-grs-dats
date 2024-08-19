import * as React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import UploadService from "../../../services/uploadService";
import ITransferDTO from "../../../types/DTO/Interfaces/ITransferDTO";

interface DownloadAris662ButtonProps {
    arisTransferDetails: ITransferDTO | null;
    uploadService: UploadService;
}

const DownloadAris662Button: React.FC<DownloadAris662ButtonProps> = ({
    arisTransferDetails,
    uploadService,
}) => {
    const handleDownload = async () => {
        try {
            const accessionNumber = arisTransferDetails?.accessionNumber;
            const applicationNumber = arisTransferDetails?.applicationNumber;

            if (!accessionNumber || !applicationNumber) {
                throw new Error("Accession Number or Application Number is missing.");
            }

            const response = await uploadService.getUpdateAris662(accessionNumber, applicationNumber);

            const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Update_Aris662-${accessionNumber}_${applicationNumber}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading the file:", error);
        }
    };

    return (
        <div>
            <Typography>
                DATS will display a “Transfer complete message” and a “Thanks Message
                or text” at this last step and a link to download the new Digital File
                List (ARS 66X)
            </Typography>
            <Button variant="contained" color="primary" onClick={handleDownload}>
                Download Digital File List
            </Button>
        </div>
    );
};

export default DownloadAris662Button;
