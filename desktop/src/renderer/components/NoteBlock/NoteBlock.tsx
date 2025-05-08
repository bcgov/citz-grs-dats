import { Stack, Typography, useTheme } from "@mui/material";

export const NoteBlock = () => {
	const theme = useTheme();

	return (
		<Stack
			gap={2}
			sx={{
				padding: 2,
				background: theme.palette.info.main,
				border: "1px solid",
				borderColor: theme.palette.info.dark,
				borderRadius: "5px",
			}}
		>
			<Typography variant="h4">Note</Typography>
			<Typography>
				Please note that this process can take considerable time. If you have a
				large transfer (i.e., &gt;5GB, &gt;5000 files), schedule your work to
				let DATS run for a few hours. We are working on making the services
				faster in future versions of DATS.
			</Typography>
		</Stack>
	);
};
