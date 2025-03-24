import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type Dispatch,
} from 'react';
import { useLocation, useNavigate as useNavigateRouter } from 'react-router';
import { useNavigateAway } from './useNavigateAway';
import { NavigationProvider } from './NavigationContext';


export const useNavigate = () => {
	const [canLoseProgress, setCanLoseProgress] = useState(false);
	const navigateRouter = useNavigateRouter();
	const { openModal } = useNavigateAway();
	const location = useLocation();

	const context = useContext(NavigationProvider);

	const navigate = useCallback((to: string) => {
		console.log('navigate', { to, canLoseProgress });
		// if (canLoseProgress) {
		openModal();
		// return;
		// }
		navigateRouter(to);
	}, []);

	useEffect(() => {
		console.log('useEffect', { location, canLoseProgress });
	}, [canLoseProgress]);

	return { location, navigate, setCanLoseProgress, NavigationContext: useContext(NavigationProvider) };
};
