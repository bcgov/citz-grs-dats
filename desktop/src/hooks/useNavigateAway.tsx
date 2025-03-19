import { NavigateAwayModal } from '@renderer/components';
import { useState } from 'react';

type NavigateAwayProps = {
	onClose?: () => void;
	onConfirm?: () => void;
};

export const useNavigateAway = ({
	onClose,
	onConfirm,
}: NavigateAwayProps = {}) => {
	const [showModal, setShowModal] = useState(false);

	const handleOnClose = () => {
		if (onClose) onClose();
		setShowModal(false);
	};

	const handleOnConfirm = () => {
		if (onConfirm) onConfirm();
		setShowModal(false);
	};

	return {
		NavigateAwayModal: () => (
			<NavigateAwayModal
				open={showModal}
				onClose={handleOnClose}
				onConfirm={handleOnConfirm}
			/>
		),
		showModal,
		closeModal: () => setShowModal(false),
		openModal: () => setShowModal(true),
	};
};
