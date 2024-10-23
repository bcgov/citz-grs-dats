import type { SSOUser, IdirIdentityProvider } from "@bcgov/citz-imb-sso-js-core";
import type { ElectronAPI } from "@electron-toolkit/preload";

declare global {
	interface Window {
		electron: ElectronAPI;
		api: {
			versions: NodeJS.Process.Versions;
			checkApiStatus: (url: string) => Promise<boolean>;
			checkIpRange: () => Promise<boolean>;
			getCurrentApiUrl: () => Promise<string>;
			startLoginProcess: () => Promise<void>;
			logout: (idToken: string | undefined) => Promise<void>;
			getUser: (accessToken: string | undefined) => SSOUser<IdirIdentityProvider> | undefined;
			safePromise: <T>(promise: Promise<T>) => Promise<[Error | null, T | null]>;
			fetchProtectedRoute: (
				url: string,
				accessToken: string | undefined,
				options: RequestInit = {},
			) => Promise<[Error | null, Response | null]>;
		};
	}
}
