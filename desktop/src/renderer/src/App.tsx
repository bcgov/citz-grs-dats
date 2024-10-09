import { useEffect, useState } from "react";
import Versions from "./components/Versions";
import electronLogo from "./assets/electron.svg";

function App(): JSX.Element {
	const [apiStatus, setApiStatus] = useState<string>("Checking...");

	const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");

	useEffect(() => {
		// Receive messages from main regarding status of connection to the API
		window.electron.ipcRenderer.on("api-status", (_event, status) => {
			setApiStatus(status);
		});

		// Clean up the listener when the component is unmounted
		return () => {
			window.electron.ipcRenderer.removeAllListeners("api-status");
		};
	}, []);

	return (
		<>
			<img alt="logo" className="logo" src={electronLogo} />
			<div className="creator">Digital Archives Transfer Service</div>
			<div className="text">
				Build an Electron app with <span className="react">React</span>
				&nbsp;and <span className="ts">TypeScript</span>
			</div>
			<p className="tip">
				Please try pressing <code>Ctrl/Cmd + Shift + I</code> to open the
				devTools
			</p>
			<div className="status">
				<strong>API Status:</strong> {apiStatus}
			</div>
			<div className="actions">
				<div className="action">
					<button type="button" onClick={ipcHandle}>
						Send IPC Ping to Main Process
					</button>
				</div>
			</div>
			<Versions />
		</>
	);
}

export default App;
