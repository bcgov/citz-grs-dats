import {
  KeycloakProvider,
  useKeycloak,
  decodeJWT,
} from "@bcgov/citz-imb-kc-react";
import { useMemo } from "react";

export const useAuthentication = () => {
  const {
    getAuthorizationHeaderValue,
    hasRole,
    login,
    logout,
    refreshToken,
    state,
  } = useKeycloak();

  const isAuthenticated = useMemo(() => {
    return state?.userInfo !== undefined;
  }, [state]);

  return {
    decodeJWT,
    getAuthorizationHeaderValue,
    hasRole,
    isAuthenticated,
    KeycloakProvider,
    login,
    logout,
    refreshToken,
    state,
  };
};

export default useAuthentication;
