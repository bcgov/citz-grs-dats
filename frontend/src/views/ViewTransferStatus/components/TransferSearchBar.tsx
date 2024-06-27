import React, { useState } from "react";
import { Box, TextField, Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { TransferStatus } from "../../../types/Enums/TransferStatus"; // Adjust the import path as necessary

interface SearchComponentProps {
    onSearch: (applicationNumber: string, accessionNumber: string, status: string) => void;
    onBrowseAll: () => void;
}

const TransferSearchBar: React.FC<SearchComponentProps> = ({ onSearch, onBrowseAll }) => {
    const [applicationNumberQuery, setApplicationNumberQuery] = useState("");
    const [accessionNumberQuery, setAccessionNumberQuery] = useState("");
    const [statusQuery, setStatusQuery] = useState("");
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    const handleApplicationNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setApplicationNumberQuery(event.target.value);
    };

    const handleAccessionNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAccessionNumberQuery(event.target.value);
    };

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        setStatusQuery(event.target.value);
    };

    const toggleAdvancedSearch = () => {
        setShowAdvancedSearch(!showAdvancedSearch);
    };

    const handleSearchClick = () => {
        onSearch(applicationNumberQuery, accessionNumberQuery, statusQuery);
    };

    const handleBrowseAllClick = () => {
        onBrowseAll();
        setApplicationNumberQuery("");
        setAccessionNumberQuery("");
        setStatusQuery("");
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', padding: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 2 }}>
                <TextField
                    label="Search by Application Number"
                    variant="outlined"
                    value={applicationNumberQuery}
                    onChange={handleApplicationNumberChange}
                />
                <TextField
                    label="Search by Accession Number"
                    variant="outlined"
                    value={accessionNumberQuery}
                    onChange={handleAccessionNumberChange}
                />
                <Button variant="contained" color="primary" onClick={handleSearchClick}>
                    Search
                </Button>
                <Button variant="contained" color="secondary" onClick={handleBrowseAllClick}>
                    Browse All
                </Button>
                <Button variant="text" color="primary" onClick={toggleAdvancedSearch}>
                    {showAdvancedSearch ? "Hide Advanced Search" : "Advanced Search"}
                </Button>
            </Box>
            {showAdvancedSearch && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 2 }}>
                    <Select
                        value={statusQuery}
                        onChange={handleStatusChange}
                        displayEmpty
                        variant="outlined"
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {Object.values(TransferStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            )}
        </Box>
    );
};

export default TransferSearchBar;
