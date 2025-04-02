import { Grid2 as Grid } from "@mui/material";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<Grid container>
			<Grid size={2} />
			<Grid
				size={8}
				sx={{ paddingTop: 3 }}
			>
				{children}
			</Grid>
      <Grid size={2} />
		</Grid>
	);
};
