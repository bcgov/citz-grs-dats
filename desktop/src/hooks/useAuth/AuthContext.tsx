import type {
	IdirIdentityProvider,
	SSOUser,
} from '@bcgov/citz-imb-sso-js-core';
import { createContext } from 'react';

export const AuthContext = createContext({
	accessToken: undefined as string | undefined,
	idToken: undefined as string | undefined,
	hasRole: (_role: string) => false as boolean,
	login: async () => {},
	logout: async () => {},
	user: undefined as SSOUser<IdirIdentityProvider> | undefined,
});
