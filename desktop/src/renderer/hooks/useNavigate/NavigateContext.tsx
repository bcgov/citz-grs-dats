import { createContext, type Dispatch } from 'react';

export const NavigateContext = createContext({
	canLoseProgress: false,
	setCanLoseProgress: (() => {}) as Dispatch<boolean>,
	navigate: (() => {}) as Dispatch<string>,
	location: { pathname: '' },
});
