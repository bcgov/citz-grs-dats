import { Alert, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const useAnimatedEllipsis = () => {
	const [dots, setDots] = useState("");

	useEffect(() => {
		const frames = [".", "..", "..."];
		let i = 0;
		const interval = setInterval(() => {
			i = (i + 1) % frames.length;
			setDots(frames[i]);
		}, 500);
		return () => clearInterval(interval);
	}, []);

	return dots;
};

type ProcessingAlertProps = {
	message: string;
};

export const ProcessingAlert = ({ message }: ProcessingAlertProps) => {
	const dots = useAnimatedEllipsis();

	return (
		<Alert
			severity="info"
			sx={{ backgroundColor: "#e3f2fd", color: "#0d47a1" }}
			icon={<CircularProgress size={20} sx={{ color: "#0d47a1" }} />}
		>
			<Stack direction="row" spacing={0}>
				<Typography variant="body2">{message}</Typography>
				<Typography variant="body2" sx={{ minWidth: "1.5em" }}>{dots}</Typography>
			</Stack>
		</Alert>
	);
};
