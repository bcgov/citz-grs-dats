import { NavigateAwayModal } from '@renderer/components';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { NavigateContext } from './NavigateContext';

export const NavigateProvider = ({ children }) => {
	const [canLoseProgress, setCanLoseProgress] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [navigatePath, setNavigatePath] = useState('');

	const location = useLocation();
	const routerNavigate = useNavigate();

	const navigate = (path) => {
		if (canLoseProgress) {
			setNavigatePath(path);
			setIsModalOpen(true);
		} else {
			routerNavigate(path);
		}
	};

	const handleClose = () => {
		setIsModalOpen(false);
		setNavigatePath('');
	};

	const handleConfirm = () => {
		setCanLoseProgress(false);
		setIsModalOpen(false);
		routerNavigate(navigatePath);
	};

	return (
		<NavigateContext.Provider
			value={{ location, navigate, setCanLoseProgress }}
		>
			{children}
			<NavigateAwayModal
				open={isModalOpen}
				onClose={handleClose}
				onConfirm={handleConfirm}
			/>
		</NavigateContext.Provider>
	);
};
