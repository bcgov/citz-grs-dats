import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
	accessToken: undefined as string | undefined,
	idToken: undefined as string | undefined,
});

export const AuthProvider = ({ children }) => {
	// Authentication state
	const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
	const [idToken, setIdToken] = useState<string | undefined>(undefined);

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

	return (
		<AuthContext.Provider value={{ accessToken, idToken }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
