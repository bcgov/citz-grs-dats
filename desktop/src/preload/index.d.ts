import type { SSOUser, IdirIdentityProvider } from "@bcgov/citz-imb-sso-js-core";
import type { ElectronAPI } from "@electron-toolkit/preload";

declare global {
	interface Window {
		electron: ElectronAPI;
		api: {
			versions: NodeJS.Process.Versions;
			checkApiStatus: () => Promise<boolean>;
			checkIpRange: () => Promise<boolean>;
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			startLoginProcess: () => Promise<any>;
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			logout: (idToken: string | undefined) => Promise<any>;
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
