import { useContext } from 'react';
import { NavigateContext } from './NavigateContext';

export const useNavigate = () => {
	return useContext(NavigateContext);
};
