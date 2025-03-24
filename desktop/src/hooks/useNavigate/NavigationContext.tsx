import { createContext, useState, type Dispatch } from 'react';

const NavigationContext = createContext({
	canLoseProgress: false,
	setCanLoseProgress: (() => {}) as Dispatch<boolean>,
});

export const NavigationProvider = ({ children }) => {
	const [canLoseProgress, setCanLoseProgress] = useState(false);
	return (
		<NavigationContext.Provider value={{ canLoseProgress, setCanLoseProgress }}>
			{children}
		</NavigationContext.Provider>
	);
};
