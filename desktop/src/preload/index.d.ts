import type { ElectronAPI } from "@electron-toolkit/preload";

declare global {
	interface Window {
		electron: ElectronAPI;
		api: {
			versions: NodeJS.Process.Versions;
			checkApiStatus: () => Promise<boolean>;
			checkIpRange: () => Promise<boolean>;
		};
	}
}
