import React, { useState } from "react";
import ITransferDTO from "../../types/DTO/Interfaces/ITransferDTO";
import { TransferService } from "../../services/transferService";
import TransferSearchBar from "./components/TransferSearchBar";
import TransfersGrid from "./components/TransfersGrid"; // Adjust the import path as necessary

export default function TransferStatusView() {
  const [transfers, setTransfers] = useState<ITransferDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const transferService = new TransferService();

  const handleSearch = async (applicationNumber: string, accessionNumber: string, status: string) => {
    setLoading(true);
    try {
      const transfers = await transferService.getTransfers();
      const filteredTransfers = transfers.filter((transfer) =>
        (applicationNumber === "" || transfer.applicationNumber.includes(applicationNumber)) &&
        (accessionNumber === "" || transfer.accessionNumber.includes(accessionNumber)) &&
        (status === "" || transfer.transferStatus === status)
      );
      setTransfers(filteredTransfers);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleBrowseAll = async () => {
    setLoading(true);
    try {
      const transfers = await transferService.getTransfers();
      setTransfers(transfers);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <>
      <TransferSearchBar onSearch={handleSearch} onBrowseAll={handleBrowseAll} />
      <TransfersGrid transfers={transfers} loading={loading} />
    </>
  );
}
