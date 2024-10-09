import {
	app,
	shell,
	BrowserWindow,
	ipcMain,
	Menu,
	type MenuItemConstructorOptions,
} from "electron";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

let mainWindow: BrowserWindow;

function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: false, // Set this to false to make sure the menu is visible during development
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.mjs"),
			sandbox: false,
		},
	});

	mainWindow.on("ready-to-show", () => {
		const menu = Menu.buildFromTemplate(
			menuTemplate as MenuItemConstructorOptions[],
		);
		Menu.setApplicationMenu(menu);

		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}

app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	// IPC test
	ipcMain.on("ping", () => console.log("pong"));

	createWindow();

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// Menu template configuration
const menuTemplate = [
	...(process.platform === "darwin"
		? [
				{
					label: app.getName(),
					submenu: [{ role: "quit" }],
				},
			]
		: []),
	{ role: "viewMenu" },
];
