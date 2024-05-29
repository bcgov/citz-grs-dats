import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Checkbox, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
const SubmissionAgreement = ({ validate }: { validate: (isValid: boolean) => void }) => {
    const [value, setValue] = React.useState('');
    React.useEffect(() => { validate(false); }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const agreed = event.target.value === 'agree';
      setValue(event.target.value);
      console.log(event.target.value);
      validate(agreed);
    };
  
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid xs={12}>
                    <Item>
                        <Typography sx={{ fontSize: 14 }} fontWeight="bold" align='center' gutterBottom>
                            BC GOVERNMENT DIGITAL ARCHIVES <br />
                            DRAFT SUBMISSION AGREEMENT
                        </Typography>
                        <Typography sx={{ fontSize: 12 }} align='left' gutterBottom>
                            This is an agreement between BC's Digital Archives and the Ministry, <br />
                            for the Transfer of government records under Application # ________ and Accession # ________.
                        </Typography>
                        <br />
                        <Typography sx={{ fontSize: 12 }} align='left' gutterBottom>
                            The purpose of this agreement is to transfer Full Retention (FR) of government records,<br />
                            after the date of their Final Disposition (FD), from the legal and physical custody of the Ministry to the Digital Archives.
                        </Typography>
                        <br />
                        <Typography sx={{ fontSize: 12 }} align='left' gutterBottom>
                            The Ministry and Digital Archives agree that:
                        </Typography>

                        <Typography sx={{ fontSize: 12 }} align='left' gutterBottom>
                            1.	The Ministry currently holds legal and physical custody  of the government records being transferred,
                        </Typography>
                        <Typography sx={{ fontSize: 12 }} align='left' gutterBottom>
                            2.	The government records are subject to the Information Management Act (IMA), Freedom of Information and
                            Protection of Privacy Act (FIPPA), and other relevant legislation.
                        </Typography>
                        <Typography sx={{ fontSize: 12 }} align='left' gutterBottom>
                            3.	The government records meet all conditions outlined in the Managing Government Information Policy (MGIP)
                            and RIM Manual Section 3.3 Transfer to Archives.
                        </Typography>
                        <Typography sx={{ fontSize: 12 }} align='left' gutterBottom>
                            4.	None of the government records being transferred will be destroyed by the Ministry until the Digital Archives verifies the creation of Archival Information Packages (AIPs) in the preservation system, which completes of the transfer process. After verification the source information will be a redundant copy and will be destroyed appropriately by the Ministry, to reduce duplication and ensure a single source of truth.
                        </Typography>
                        <Typography sx={{ fontSize: 12 }} align='left' gutterBottom>
                            5.	Upon completion of the transfer process the Digital Archives will assume legal and physical custody and be responsible for the ongoing management of the archived government records on behalf of the Province.
                        </Typography>
                        <Typography sx={{ fontSize: 12 }} align='left' gutterBottom>
                            6.	The Digital Archives will protect personal information and provide access to the government records in accordance with the Information Management Act (IMA), the Freedom of Information and Protection of Privacy Act, and other relevant legislation.
                        </Typography>
                    </Item>
                    <FormLabel id="demo-controlled-radio-buttons-group">Do you agree with this Submission Agreement</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={value}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="agree" control={<Radio />} label="Agree" />
                        <FormControlLabel value="disagree" control={<Radio />} label="Reject" />
                    </RadioGroup>
                </Grid>
            </Grid>
        </Box>
    );
}
export default SubmissionAgreement;