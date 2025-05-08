import { createContext, type Dispatch } from 'react';

export const NavigateContext = createContext({
	setCanLoseProgress: (() => {}) as Dispatch<boolean>,
	navigate: (() => {}) as Dispatch<string>,
	location: { pathname: '' },
});
