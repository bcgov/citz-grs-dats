import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
const SubmissionAgreement: React.FC = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid xs={6} md={8}>
                    <Item>
                        <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                            Soumission Agreement
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
                            blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur,
                            neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti? Eum
                            quasi quidem quibusdam.
                        </Typography>


                    </Item>
                </Grid>
                <Grid xs={6} md={4}>
                    <Item>Help Text</Item>
                </Grid>
            </Grid>
        </Box>
    );
}
export default SubmissionAgreement;