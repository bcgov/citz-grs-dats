import { useAuth, useNavigate } from '@/hooks';
import { Button } from '@bcgov/design-system-react-components';
import {
  Stack,
  Typography
} from '@mui/material';
import type { PageLinkProps } from './PageLinkCards.d';

export const PageLinkCard = (props: PageLinkProps) => {
	const { title, icon, desc, buttonText, pageRoute, role } = props;

	const { navigate } = useNavigate();
	const { hasRole } = useAuth();

	if (role && !hasRole(role)) return null;

	return (
		<Stack
			gap={2}
			sx={{ padding: '16px', background: '#FAF9F8' }}
		>
			<Stack
				direction='row'
				gap={1}
				sx={{ alignItems: 'center' }}
			>
				{icon}
				<Typography variant='h4'>{title}</Typography>
			</Stack>
			<Typography sx={{ fontSize: '0.9em' }}>{desc}</Typography>
			<Button
				variant='primary'
				style={{ width: 'fit-content' }}
				onPress={() => navigate(pageRoute)}
			>
				{buttonText}
			</Button>
		</Stack>
	);
};
