import type {
  IdirIdentityProvider,
  SSOUser,
} from "@bcgov/citz-imb-sso-js-core";
import { createContext } from "react";

type RefreshedTokens = {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessExpiresIn?: string;
  refreshExpiresIn?: string;
};

export const AuthContext = createContext({
  accessToken: undefined as string | undefined,
  idToken: undefined as string | undefined,
  hasRole: (_role: string) => false as boolean,
  login: async () => {},
  logout: async () => {},
  refresh: async (): Promise<RefreshedTokens | null> => null,
  user: undefined as SSOUser<IdirIdentityProvider> | undefined,
});
