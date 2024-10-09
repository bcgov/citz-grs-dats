import { useEffect, useState } from "react";
import { Versions, VPNPopup } from "./components";
import electronLogo from "./assets/electron.svg";

function App(): JSX.Element {
	const [apiStatus, setApiStatus] = useState<string>("Checking...");
	const [showVPNPopup, setShowVPNPopup] = useState<boolean | null>(null);
	const [api] = useState(window.api);

	const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");

	const handleIPStatusUpdate = async () => {
		const ipStatusOK = await api.checkIpRange();
		setShowVPNPopup(!ipStatusOK);
	};

	const handleAPIStatusUpdate = async () => {
		const apiStatusOK = await api.checkApiStatus();
		setApiStatus(apiStatusOK ? "Online" : "Offline");
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		handleAPIStatusUpdate();

		handleIPStatusUpdate();
		// Set an interval to check the API status every 5 seconds
		const interval = setInterval(handleIPStatusUpdate, 5 * 1000);

		return () => clearInterval(interval); // Clean up interval on unmount
	}, []);

	return (
		<>
			<img alt="logo" className="logo" src={electronLogo} />
			<div className="creator">Digital Archives Transfer Service</div>
			<div className="text">
				Build an Electron app with <span className="react">React</span> and{" "}
				<span className="ts">TypeScript</span>
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
			{showVPNPopup && <VPNPopup />}
		</>
	);
}

export default App;
