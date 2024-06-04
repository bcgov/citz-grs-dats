// src/TransferComponent.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, List, ListItem, ListItemText, CircularProgress, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ITransferDTO from '../../../types/DTO/Interfaces/ITransferDTO';
import { TransferService } from '../../../services/transferService';

const TransferComponent: React.FC<{ accessionNumber: string | undefined; applicationNumber: string | undefined}> = ({ accessionNumber, applicationNumber }) => {
  const [transfer, setTransfer] = useState<ITransferDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const transferService = new TransferService();

  useEffect(() => {
    const fetchTransfer = async () => {
        if(!accessionNumber || !applicationNumber)
            {
                console.log('Accession Number and Application Number is empty')
                return;
            }
        transferService
            .getTransferByApplicationAccessionNumber(
                accessionNumber,
                applicationNumber,
                (response) => {
                    setTransfer(response);
                },
                (error)=> {
                    console.error("Error fetching the transfer data:", error);
                },
                () => {
                    setLoading(false);
                }

            )
    };

    fetchTransfer();
  }, [accessionNumber, applicationNumber]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!transfer) {
    return <Typography variant="h6">No data found</Typography>;
  }

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <Typography variant="h5">Transfer Details</Typography>
        
      </Paper>
    </Container>
  );
};

export default TransferComponent;
