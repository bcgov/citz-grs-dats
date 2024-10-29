import { useEffect, useState } from "react";
import { AuthButton, ProcessFolderButton, Versions, VPNPopup } from "./components";
import electronLogo from "./assets/electron.svg";

function App(): JSX.Element {
	const [api] = useState(window.api); // Preload scripts
	const [apiStatus, setApiStatus] = useState<string>("Checking...");
	const [showVPNPopup, setShowVPNPopup] = useState<boolean | null>(null);

	// Authentication state
	const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
	const [idToken, setIdToken] = useState<string | undefined>(undefined);

	useEffect(() => {
		// Handle "auth-success" message from main process
		// Triggered upon successful login
		window.electron.ipcRenderer.on("auth-success", (_, tokens) => {
			setAccessToken(tokens.accessToken);
			setIdToken(tokens.idToken);
		});

		// Handle "token-refresh-success" message from main process
		// Triggered upon successful refresh of tokens
		window.electron.ipcRenderer.on("token-refresh-success", (_, tokens) =>
			setAccessToken(tokens.accessToken),
		);

		// Handle "auth-logout" message from main process
		// Triggered upon logout
		window.electron.ipcRenderer.on("auth-logout", () => setAccessToken(undefined));

		// Cleanup
		return () => {
			window.electron.ipcRenderer.removeAllListeners("auth-success");
			window.electron.ipcRenderer.removeAllListeners("auth-logout");
			window.electron.ipcRenderer.removeAllListeners("token-refresh-success");
		};
	}, []);

	const handleIPStatusUpdate = async () => {
		const ipStatusOK = await api.checkIpRange();
		setShowVPNPopup(!ipStatusOK);
	};

	const handleAPIStatusUpdate = async () => {
		const url = await api.getCurrentApiUrl();
		const apiStatusOK = await api.checkApiStatus(url);
		setApiStatus(apiStatusOK ? "Online" : "Offline");
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// Check if API is health upon first load
		handleAPIStatusUpdate();

		// Check for VPN or gov Network use on load, and every 5 seconds
		handleIPStatusUpdate();
		const interval = setInterval(handleIPStatusUpdate, 5 * 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	const handleTestRoute = async () => {
		const url = await api.getCurrentApiUrl();
		const [error, response] = await api.sso.fetchProtectedRoute(`${url}/test`, accessToken);

		if (error) console.log("Error in fetch: ", error);
		console.log("Result: ", await response?.json());
	};

	return (
		<>
			<img alt="logo" className="logo" src={electronLogo} />
			<div className="creator">Digital Archives Transfer Service</div>
			<div className="text">
				Build an Electron app with <span className="react">React</span> and{" "}
				<span className="ts">TypeScript</span>
			</div>
			<p className="tip">
				Please try pressing <code>Ctrl + Shift + I or Cmd + Option + I</code> to open the devTools
			</p>
			<div className="status">
				<strong>API Status:</strong> {apiStatus}
			</div>
			<div className="tip">
				{accessToken && `Hello ${api.sso.getUser(accessToken)?.display_name}!`}
			</div>
			<div className="actions">
				<div className="action">
					<AuthButton accessToken={accessToken} idToken={idToken} />
				</div>
				<div className="action">
					<button type="button" onClick={handleTestRoute}>
						Log Protected Route Test
					</button>
				</div>
				<div className="action">
					<button type="button" onClick={() => console.log("User: ", api.sso.getUser(accessToken))}>
						Log User
					</button>
				</div>
				<div className="action">
					<ProcessFolderButton />
				</div>
			</div>
			<Versions />
			{showVPNPopup && <VPNPopup />}
		</>
	);
}

export default App;
