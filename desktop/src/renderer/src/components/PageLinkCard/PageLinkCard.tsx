import { Button } from "@bcgov/design-system-react-components";
import { Stack, Typography } from "@mui/material";
import { useAuth, useNavigate } from "@renderer/hooks";
import type { PageLinkProps } from "./PageLinkCards.d";

export const PageLinkCard = (props: PageLinkProps) => {
	const { title, icon, desc, buttonText, pageRoute, role } = props;

	const { navigate } = useNavigate();
	const { hasRole } = useAuth();

	if (role && !hasRole(role)) return null;

	return (
		<Stack gap={2} sx={{ padding: "16px", background: "#FAF9F8" }}>
			<Stack direction="row" gap={1} sx={{ alignItems: "center" }}>
				{icon}
				<Typography variant="h3" sx={{ color: "var(--text)" }}>
					{title}
				</Typography>
			</Stack>
			<Typography sx={{ fontSize: "16px" }}>{desc}</Typography>
			<Button
				variant="primary"
				style={{ width: "fit-content" }}
				onPress={() => navigate(pageRoute)}
			>
				{buttonText}
			</Button>
		</Stack>
	);
};
