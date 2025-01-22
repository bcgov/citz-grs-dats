import { dialog, type BrowserWindow } from "electron";

let selectedDir: string[] | undefined;
let dirPathArray: string[];

/**
 * Opens a (modal) dialog window off the main window for a user to select a directory.
 *
 * @param win - the main process window.
 * @returns A string[] if a directory is selected or undefined if the dialog is closed with no selection.
 */
export const selectDirectory = (win: BrowserWindow): string[] => {
	// open a dialog and allow a user to select multiple folders
	selectedDir = dialog.showOpenDialogSync(win, {
		properties: ["openDirectory", "multiSelections"],
	});

	// if selectedDir is undefined we have no selected path so return an empty array
	// otherwise return the array of selected paths
	dirPathArray = selectedDir ?? [""];

	return dirPathArray;
};
