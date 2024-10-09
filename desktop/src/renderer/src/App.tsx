import { useState } from "react";
import Versions from "./components/Versions";
import electronLogo from "./assets/electron.svg";

function App(): JSX.Element {
	const [apiStatus, setApiStatus] = useState<string>("Checking...");
	const [api] = useState(window.api);

	const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");

	const handleAPIStatusUpdate = async () => {
		const statusOK = await api.checkApiStatus();
		setApiStatus(statusOK ? "Online" : "Offline");
	};

	// Set an interval to check the API status every 30 seconds
	setInterval(handleAPIStatusUpdate, 30 * 1000); // 30 seconds interval
	// Immediately check the API status when the preload script is loaded
	handleAPIStatusUpdate();

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
