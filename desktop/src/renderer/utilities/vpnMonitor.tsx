import { useEffect, useState } from 'react';
import { VPNPopup } from '../components';

export const VPNMonitor = ({ children }) => {
	const [api] = useState(window.api); // Preload scripts
	const [showVPNPopup, setShowVPNPopup] = useState(true);

	const checkVPN = async () => {
		const ipStatusOK = await api.checkIpRange();
		setShowVPNPopup(!ipStatusOK);
	};

	useEffect(() => {
		checkVPN();
		const interval = setInterval(checkVPN, 5 * 1000);
		return () => {
			clearInterval(interval);
		};
	}, []);

	// if (showVPNPopup) return <VPNPopup open={true} />;

	return children;
};
