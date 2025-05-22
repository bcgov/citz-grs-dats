import { Grid2 as Grid } from "@mui/material";
import { useNotification } from "@renderer/hooks";

export const PageLayout = ({ children, size }: { children: React.ReactNode; size?: number[] }) => {
	const { notify } = useNotification();

	if (!size) size = [2, 8, 2];
	if (size.length !== 3) {
		notify.error("PageLayout size prop must be an array of 3 numbers");
		size = [2, 8, 2];
	}
	if (size[0] < 0 || size[1] < 0 || size[2] < 0) {
		notify.error("PageLayout size prop must be an array of 3 positive numbers");
		size = [2, 8, 2];
	}
	if (size[0] + size[1] + size[2] !== 12) {
		notify.error("PageLayout size prop must be an array of 3 numbers that add up to 12");
		size = [2, 8, 2];
	}

	return (
		<Grid container>
			<Grid size={size[0]} />
			<Grid size={size[1]} sx={{ paddingTop: 3 }}>
				{children}
			</Grid>
			<Grid size={size[2]} />
		</Grid>
	);
};
