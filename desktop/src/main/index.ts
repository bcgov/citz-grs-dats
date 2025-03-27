import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  Menu,
  clipboard,
  type MenuItemConstructorOptions,
  dialog,
} from "electron";
import path, { join } from "node:path";
import { is } from "@electron-toolkit/utils";
import electronUpdater, { type AppUpdater } from "electron-updater";
import { createWorkerPool } from "./fileProcessing";
import {
  getFolderBuffer,
  getFolderMetadata,
  selectDirectory,
} from "./fileProcessing/actions";
import EventEmitter from "node:events";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import fs from "node:fs";
import fsPromises from "node:fs/promises";

const appVersion = app.getVersion();
console.log(`App Version: ${appVersion}`);

const streamPipeline = promisify(pipeline);

// Set because we have many listeners when the worker scripts are running for every folder uploaded.
EventEmitter.defaultMaxListeners = 1000; // Set globally for all EventEmitters
ipcMain.setMaxListeners(1000); // Explicitly set for ipcMain

app.setName("Digital Archives Transfer Service");

const DEBUG = is.dev;

let mainWindow: BrowserWindow;
let authWindow: BrowserWindow | null = null;
let refreshInterval: NodeJS.Timeout | undefined;

const tokens: Record<string, string | undefined> = {
  accessToken: undefined,
  refreshToken: undefined,
  idToken: undefined,
  accessExpiresIn: undefined,
  refreshExpiresIn: undefined,
};

// API URL constants
const LOCAL_API_URL = "http://localhost:3200";
const DEV_API_URL =
  "https://citz-grs-dats-api-v2-route-ede50e-dev.apps.silver.devops.gov.bc.ca";
const TEST_API_URL =
  "https://citz-grs-dats-api-v2-route-ede50e-test.apps.silver.devops.gov.bc.ca";
const PROD_API_URL =
  "https://citz-grs-dats-api-v2-route-ede50e-prod.apps.silver.devops.gov.bc.ca";

// Set initial API URL based on environment
let currentApiUrl = is.dev ? LOCAL_API_URL : PROD_API_URL;

const pool = createWorkerPool();

const debug = (log: string, data: unknown = "") => {
  if (DEBUG) console.info(log, data);
};

// Update API URL
const setApiUrl = (apiUrl: string) => {
  currentApiUrl = apiUrl;
  mainWindow.webContents.send("api-url-changed", apiUrl);
};

function createWindow(): void {
  mainWindow = new BrowserWindow({
    minWidth: 1200,
    minHeight: 750,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    const menu = Menu.buildFromTemplate(
      menuTemplate as MenuItemConstructorOptions[]
    );
    Menu.setApplicationMenu(menu);
    mainWindow.setTitle(app.getName()); // Sets name in top left corner of window.
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on("close", (event) => {
    event.preventDefault(); // Prevent default closing
    mainWindow.webContents.send("app-close-requested"); // Notify renderer
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

const releaseNotesJsonPath = is.dev
  ? path.resolve(__dirname, "../../resources/release_notes.json")
  : path.join(app.getAppPath(), "../../resources/release_notes.json");

ipcMain.handle("get-release-notes", async () => {
  try {
    const releaseNotesData = await fsPromises.readFile(
      releaseNotesJsonPath,
      "utf-8"
    );
    return JSON.parse(releaseNotesData);
  } catch (error) {
    console.error("Error reading release notes:", error);
    return null;
  }
});

ipcMain.handle("update-viewed-release-version", async () => {
  try {
    // Dont update in development because this is supposed to be updated on the user's
    // machine and note pushed as an update to github.
    if (is.dev) return;

    // Read the existing release notes
    const data = await fsPromises.readFile(releaseNotesJsonPath, "utf-8");
    const releaseNotes = JSON.parse(data);

    // Update the `viewedReleaseVersion`
    releaseNotes.viewedReleaseVersion = appVersion;

    // Write the updated JSON back to the file
    await fsPromises.writeFile(
      releaseNotesJsonPath,
      JSON.stringify(releaseNotes, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error updating viewed release version:", error);
  }
});

ipcMain.handle("get-current-app-version", () => {
  return appVersion;
});

ipcMain.handle("get-current-api-url", () => {
  return currentApiUrl;
});

// Shutdown all worker scripts
ipcMain.handle("shutdown-workers", () => {
  pool.shutdown();
});

// Shutdown a specific worker script
// (eg. When a folder is deleted from a transfer, stop processing it)
ipcMain.handle("shutdown-worker-by-id", (_event, workerId: string): boolean => {
  return pool.shutdownWorkerById(workerId);
});

ipcMain.handle("start-login-process", async () => {
  debug('Beginning "start-login-process" of main process.');

  // Create a new browser window for the authentication process
  authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  authWindow.loadURL(`${currentApiUrl}/auth/login`);

  // Listen for redirect navigation to the callback URL with the code parameter
  authWindow.webContents.on("did-redirect-navigation", async (_event, url) => {
    const urlObj = new URL(url);
    if (urlObj.pathname === "/auth/login/callback") {
      const code = urlObj.searchParams.get("code");
      if (code) {
        try {
          setTimeout(async () => {
            const cookies = await authWindow?.webContents.session.cookies.get({
              url: currentApiUrl,
            });

            if (!cookies || cookies?.length === 0)
              throw new Error("No cookies found for the session.");

            // Find cookies that contain the token information
            cookies.forEach((cookie) => {
              if (cookie.name === "access_token")
                tokens.accessToken = cookie.value;
              if (cookie.name === "refresh_token")
                tokens.refreshToken = cookie.value;
              if (cookie.name === "id_token") tokens.idToken = cookie.value;
              if (cookie.name === "expires_in")
                tokens.accessExpiresIn = cookie.value;
              if (cookie.name === "refresh_expires_in")
                tokens.refreshExpiresIn = cookie.value;
            });

            // Notify the renderer process and schedule token refreshing
            if (tokens.accessToken && tokens.refreshToken) {
              debug("Tokens retrieved from cookies.");
              scheduleRefreshTokens();
              mainWindow.webContents.send("auth-success", tokens);
            } else throw new Error("Required tokens not found in cookies.");
          }, 1000);
        } catch (error) {
          console.error("Error during login process:", error);
          authWindow?.close(); // Close the window even in case of error
          authWindow = null;
        } finally {
          // Hide window
          authWindow?.hide();
        }
      }
    }
  });

  // Handle the case where the user closes the auth window manually
  authWindow.on("closed", () => {
    authWindow = null;
  });
});

ipcMain.handle("start-logout-process", async (_, idToken: string) => {
  debug('Beginning "start-logout-process" of main process.');

  // Open a new window for the logout process
  if (!authWindow) {
    authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
  }

  authWindow.loadURL(`${currentApiUrl}/auth/logout?id_token=${idToken}`);

  authWindow.webContents.on("did-redirect-navigation", async (_event, url) => {
    if (url.includes("/auth/logout/callback")) clearAuthState();
  });

  authWindow.on("closed", () => {
    authWindow = null;
  });
});

ipcMain.handle(
  "get-folder-metadata",
  async (event, { filePath }: { filePath: string }) => {
    debug('Beginning "get-folder-metadata" of main process.');

    const onFailure = (error: unknown) => {
      event.sender.send("folder-metadata-completion", {
        success: false,
        error,
      });
    };

    try {
      const workerId = await getFolderMetadata(
        pool,
        filePath,
        is.dev,
        onFailure
      );

      return { success: true, workerId };
    } catch (error) {
      console.error(`Error in get-folder-metadata: ${error}`);
      onFailure(error);
      return { success: false, error };
    }
  }
);

ipcMain.handle(
  "get-folder-buffer",
  async (event, { filePath }: { filePath: string }) => {
    debug('Beginning "get-folder-buffer" of main process.');

    const onFailure = (error: unknown) => {
      event.sender.send("folder-buffer-completion", {
        success: false,
        error,
      });
    };

    try {
      const workerId = await getFolderBuffer(pool, filePath, is.dev, onFailure);

      return { success: true, workerId };
    } catch (error) {
      console.error(`Error in get-folder-buffer: ${error}`);
      onFailure(error);
      return { success: false, error };
    }
  }
);

ipcMain.handle(
  "select-directory",
  (_, { singleSelection }: { singleSelection?: boolean } = {}) => {
    debug('Beginning "select-directory" of main process.');
    // returns selected folder or undefined if no folder was selected
    return selectDirectory(mainWindow, singleSelection);
  }
);

const clearAuthState = () => {
  debug("Clearing authentication state.");

  if (authWindow && !authWindow.isDestroyed()) {
    authWindow.close();
  }
  authWindow = null;

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("auth-logout");
  }

  if (refreshInterval) clearInterval(refreshInterval);

  Object.keys(tokens).forEach((key) => {
    tokens[key] = undefined;
  });
};

const scheduleRefreshTokens = () => {
  debug("Scheduling token refresh.");

  if (!tokens.refreshExpiresIn || !tokens.accessExpiresIn) {
    console.error("Missing token expiry values after login.");
    return;
  }

  const accessTokenExpiresMs = Number(tokens.accessExpiresIn) * 1000;
  const refreshTokenExpiresMs = Number(tokens.refreshExpiresIn) * 1000;

  // Clear existing intervals before setting a new one
  if (refreshInterval) clearInterval(refreshInterval);

  // Refresh the access token before it expires
  refreshInterval = setInterval(() => {
    refreshTokens();
  }, accessTokenExpiresMs - 5000); // Refresh slightly before expiration

  // Instead of a static timeout, reset it when a new refresh token is acquired
  if (tokens.refreshToken) {
    setTimeout(() => {
      if (tokens.refreshToken) {
        debug("Refresh token expired, but was replaced. Continuing session.");
      } else {
        debug("Refresh token expired with no replacement. Logging out.");
        clearAuthState();
      }
    }, refreshTokenExpiresMs - 5000);
  }
};

const refreshTokens = async () => {
  debug("Refreshing tokens...");

  try {
    if (!tokens.refreshToken) {
      console.error("No refresh token available.");
      return clearAuthState();
    }

    authWindow?.loadURL(`${currentApiUrl}/auth/token`);

    setTimeout(async () => {
      const cookies = await authWindow?.webContents.session.cookies.get({
        url: currentApiUrl,
      });

      if (!cookies || cookies.length === 0) {
        throw new Error("No cookies found for the session.");
      }

      // Update token values
      cookies.forEach((cookie) => {
        if (cookie.name === "access_token") tokens.accessToken = cookie.value;
        if (cookie.name === "refresh_token") tokens.refreshToken = cookie.value;
        if (cookie.name === "expires_in") tokens.accessExpiresIn = cookie.value;
        if (cookie.name === "refresh_expires_in")
          tokens.refreshExpiresIn = cookie.value;
      });

      if (tokens.refreshToken) {
        debug("Successfully refreshed tokens.");
        scheduleRefreshTokens(); // Reschedule with the new refresh token expiration
        mainWindow.webContents.send("token-refresh-success", tokens);
      } else {
        throw new Error("Failed to retrieve new refresh token.");
      }
    }, 1000);
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    clearAuthState(); // Only clear auth if we actually fail to refresh
  }
};

ipcMain.on("download-transfer", async (_event, downloadURL: string) => {
  try {
    console.log(`Downloading file from: ${downloadURL}`);

    const response = await fetch(downloadURL);
    if (!response.ok)
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    if (!response.body)
      throw new Error("Response body is null. Cannot download file.");

    // Get the file name from the URL
    const fileName = path.basename(new URL(downloadURL).pathname);
    const savePath = path.join(app.getPath("downloads"), fileName);

    // Stream the file to the filesystem
    const fileStream = fs.createWriteStream(savePath);
    // biome-ignore lint/suspicious/noExplicitAny:
    await streamPipeline(response.body as any, fileStream);

    console.log("Download transfer complete:", savePath);

    // Notify the Renderer process
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send("download-transfer-complete", savePath);
    });
  } catch (error) {
    console.error("Download transfer error:", error);
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send("download-transfer-failed");
    });
  }
});

const menuTemplate = [
  ...(process.platform === "darwin"
    ? [{ label: app.getName(), submenu: [{ role: "quit" }] }]
    : []),
  { role: "viewMenu" },
  {
    label: "Developer",
    submenu: [
      {
        label: `App Version ${appVersion}`,
      },
      {
        label: "Select Environment",
        submenu: [
          {
            label: "Local",
            type: "radio",
            checked: currentApiUrl === LOCAL_API_URL,
            click: () => setApiUrl(LOCAL_API_URL),
          },
          {
            label: "Dev",
            type: "radio",
            checked: currentApiUrl === DEV_API_URL,
            click: () => setApiUrl(DEV_API_URL),
          },
          {
            label: "Test",
            type: "radio",
            checked: currentApiUrl === TEST_API_URL,
            click: () => setApiUrl(TEST_API_URL),
          },
          {
            label: "Prod",
            type: "radio",
            checked: currentApiUrl === PROD_API_URL,
            click: () => setApiUrl(PROD_API_URL),
          },
        ],
      },
      {
        label: "Copy Auth Token",
        click: () => {
          if (tokens.accessToken) {
            clipboard.writeText(tokens.accessToken);
            mainWindow.webContents.send("auth-token-copied", {
              message: "Access token copied to clipboard!",
            });
          } else {
            mainWindow.webContents.send("auth-token-copied", {
              message: "No access token available to copy. Login first.",
            });
          }
        },
      },
    ],
  },
];

export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  return autoUpdater;
}

app.whenReady().then(() => {
  createWindow();

  // Start checking for updates after the window is ready
  const autoUpdater = getAutoUpdater();
  autoUpdater.checkForUpdatesAndNotify();

  // Auto Update Event Listeners
  autoUpdater.on("update-available", () => {
    dialog.showMessageBox({
      type: "info",
      title: "Update Available",
      message:
        "A new version is available. It will be downloaded in the background.",
    });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        type: "question",
        title: "Update Ready",
        message:
          "An update has been downloaded. Please update before continuing.",
        buttons: ["Restart and Install"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });
});

ipcMain.handle("force-quit-app", () => {
  app.quit();
});

// Ensure all windows are closed when quitting
app.on("before-quit", () => {
  ipcMain.removeAllListeners();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners();
    mainWindow.close();
  }

  if (authWindow && !authWindow.isDestroyed()) {
    authWindow.removeAllListeners();
    authWindow.close();
  }
});

app.on("window-all-closed", () => {
  clearAuthState();

  if (process.platform !== "darwin") {
    setTimeout(() => {
      if (!mainWindow || mainWindow.isDestroyed()) {
        app.quit();
      }
    }, 100); // Delay ensures everything has cleaned up before quitting
  }
});

app.on("quit", () => {
  if (pool) pool.shutdown(); // Ensure worker pool is terminated
  process.exit(0); // Forcefully kill the process
});
