import { createContext, useContext, useState, type Dispatch } from 'react';

const ProgressContext = createContext({
	progressMade: false,
	setProgressMade: (() => {}) as Dispatch<boolean>,
});

export const ProgressProvider = ({ children }) => {
	const [progressMade, setProgressMade] = useState(false);
	return (
		<ProgressContext.Provider value={{ progressMade, setProgressMade }}>
			{children}
		</ProgressContext.Provider>
	);
};

export const useProgress = () => {
	return useContext(ProgressContext);
};
