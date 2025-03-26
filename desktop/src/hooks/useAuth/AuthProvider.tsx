import type {
  IdirIdentityProvider,
  SSOUser
} from '@bcgov/citz-imb-sso-js-core';
import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [sso] = useState(window.api.sso);

  // Authentication state
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [idToken, setIdToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<SSOUser<IdirIdentityProvider> | undefined>(
		undefined,
	);

  const login = async () => await sso.startLoginProcess();
  const logout = async () => await sso.logout(idToken);

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.hasRoles([role]);
  };

  useEffect(() => {
    // Handle "auth-success" message from main process
    // Triggered upon successful login
    window.electron.ipcRenderer.on('auth-success', (_, tokens) => {
      setAccessToken(tokens.accessToken);
      setIdToken(tokens.idToken);
    });

    // Handle "token-refresh-success" message from main process
    // Triggered upon successful refresh of tokens
    window.electron.ipcRenderer.on('token-refresh-success', (_, tokens) =>
      setAccessToken(tokens.accessToken),
    );

    // Handle "auth-logout" message from main process
    // Triggered upon logout
    window.electron.ipcRenderer.on('auth-logout', () =>
      setAccessToken(undefined),
    );

    // Alert when auth token copied.
    window.electron.ipcRenderer.on('auth-token-copied', (_, obj) =>
      alert(obj.message),
    );

    // Cleanup
    return () => {
      window.electron.ipcRenderer.removeAllListeners('auth-success');
      window.electron.ipcRenderer.removeAllListeners('auth-logout');
      window.electron.ipcRenderer.removeAllListeners('token-refresh-success');
      window.electron.ipcRenderer.removeAllListeners('auth-token-copied');
    };
  }, []);

  useEffect(() => {
    if (accessToken) {
      setUser(sso.getUser(accessToken));
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, idToken, hasRole, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
