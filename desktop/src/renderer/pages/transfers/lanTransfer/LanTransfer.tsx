import { useAuth, useMetadataCache, useNavigate } from "@/renderer/hooks";
import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import { LoginRequiredModal, ResumeSessionModal, Stepper, Toast } from "@renderer/components";
import {
	JustifyChangesModal,
	TransferAlreadyProcessedModal,
	TransferAlreadySentModal,
} from "@renderer/components/transfer";
import { FinishView } from "@renderer/components/transfer/finish-view";
import {
	LanConfirmationView,
	LanSubmissionAgreementView,
	LanUploadFileListView,
	LanUploadTransferFormView,
} from "@renderer/components/transfer/lan-views";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getXlsxFileListToastData } from "../utils";
import {
	checkForExistingTransfer,
	getFolderBuffer,
	getFolderMetadata,
	parseFileList,
} from "./helpers";
import type { FileBufferObj, Folder, FolderUploadChange, RunningWorker } from "./types";

	type FolderMessage = { metadata: string | null; copy: string | null };

export const LanTransferPage = () => {
	const [api] = useState(window.api); // Preload scripts

  const { navigate, setCanLoseProgress } = useNavigate();
	const { idToken, accessToken, refresh } = useAuth();

	const { cachedFolders, clearAll } = useMetadataCache();

	const handleLogout = async () => await api.sso.logout(idToken);

	const [currentViewIndex, setCurrentViewIndex] = useState(0);
	const [showResumeModal, setShowResumeModal] = useState(false);
	const [dismissedResumeModal, setDismissedResumeModal] = useState(false);
	const [hasLanSession, setHasLanSession] = useState(false);
	const [fileList, setFileList] = useState<File | null | undefined>(undefined);
	const [transferForm, setTransferForm] = useState<File | null | undefined>(undefined);
	const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
	const [showTransferAlreadyProcessedModal, setShowTransferAlreadyProcessedModal] = useState(false);
	const [showTransferAlreadySentModal, setShowTransferAlreadySentModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

	// Request to send transfer
	const [requestSuccessful, setRequestSuccessful] = useState<boolean | null>(null);
	const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
	const [runningWorkers, setRunningWorkers] = useState<RunningWorker[]>([]);

	// File list
	const [metadata, setMetadata] = useState<Record<string, unknown>>({});
	const [extendedMetadata, setExtendedMetadata] = useState<Record<string, unknown>>({});
	const [originalFolderList, setOriginalFolderList] = useState<Record<string, unknown>>({});
	const [folderBuffers, setFolderBuffers] = useState<Record<string, FileBufferObj[]>>({});
	const [tempDirs, setTempDirs] = useState<string[]>([]);
	const [foldersToProcess, setFoldersToProcess] = useState<string[]>([]);
	const [folders, setFolders] = useState<Folder[]>([]);
	const [changes, setChanges] = useState<FolderUploadChange[]>([]);
	const [folderMessages, setFolderMessages] = useState<Record<string, FolderMessage>>({});
	const [globalMessage, setGlobalMessage] = useState<string | null>(null);

	// Justify changes
	const [showJustifyChangesModal, setShowJustifyChangesModal] = useState(false);
	const [changesJustification, setChangesJustification] = useState("");

	// Accession & application pulled from fileList
	const [accession, setAccession] = useState<string>("");
	const [application, setApplication] = useState<string>("");
	const [allowAccessionChange, setAllowAccessionChange] = useState<boolean>(true);
	const [allowApplicationChange, setAllowApplicationChange] = useState<boolean>(true);
	// User confirms if accession & application are correct
	const [confirmAccAppChecked, setConfirmAccAppChecked] = useState<boolean>(false);
	const [submissionAgreementAccepted, setSubmissionAgreementAccepted] = useState<boolean>(false);

	// Track cached folder progress for resume
	const cachedFoldersRef = useRef(cachedFolders);

	const resetStates = useCallback(async () => {
		setAccession("");
		setAllowAccessionChange(true);
		setApplication("");
		setAllowApplicationChange(true);
		setFolders([]);
		setFoldersToProcess([]);
		setMetadata({});
		setExtendedMetadata({});
		setUploadSuccess(null);
		setConfirmAccAppChecked(false);
		setSubmissionAgreementAccepted(false);
		setFolderMessages({});
		setGlobalMessage(null);
		await api.deleteTransferSession("lan");
		await api.workers.shutdown();
	}, []);

	const onNextPress = () => {
		setCurrentViewIndex((prev) => prev + 1);
	};

	const onBackPress = () => {
		setCurrentViewIndex((prev) => prev - 1);
	};

	const handleShutdownWorker = async (folder: string) => {
		const workersToShutdown = runningWorkers.filter((worker) => worker.folder === folder);

		for (const worker of workersToShutdown) {
			if (worker.id) {
				await api.workers.shutdownById(worker.id);
			}
		}

		// Remove workers from the running list
		setRunningWorkers((prev) => prev.filter((worker) => worker.folder !== folder));
	};

	const handleRowUpdate = (newFolder: Folder) => {
		// Update the row in the state
		setFolders((prevRows) => prevRows.map((row) => (row.id === newFolder.id ? newFolder : row)));
		return newFolder;
	};

	const handleEditClick = async (folderPath: string): Promise<void> => {
		const result = await api.selectDirectory({ singleSelection: true });
		const selectedFolderPath = result[0];

		if (!selectedFolderPath) return;

		// Folder already exists in file list.
		if (folders.some((row) => row.folder === selectedFolderPath)) {
			toast.error(Toast, {
				data: {
					success: false,
					title: "Folder edit unsuccessful",
					message:
						"The folder path you selected is already used in the file list. Please select a different folder path.",
				},
			});
			console.log("Folder edit unsuccessful: Folder path already used.");
			return;
		}

		setFolders((prev) =>
			prev.map((row) => {
				if (row.folder === folderPath)
					return { ...row, folder: selectedFolderPath, invalidPath: false };
				return row;
			}),
		);
		setChanges((prev) => [
			...prev,
			{
				originalFolderPath: folderPath,
				newFolderPath: selectedFolderPath,
				deleted: false,
			},
		]);
		setFoldersToProcess((prev) => [...prev, selectedFolderPath]);
	};

	// Handle metadata progress and completion events
	useEffect(() => {
		const handleProgress = (event: CustomEvent<{ source: string; progressPercentage: number; fileProcessed?: string; currentFileIndex?: number; totalFiles?: number }>) => {
			const { source, progressPercentage, fileProcessed, currentFileIndex: fileIdx, totalFiles: total } = event.detail;
			const folderName = source.split("\\").pop() ?? source;
			console.log(`[${folderName}] Processing metadata for ${fileProcessed}... (${fileIdx}/${total}) - ${progressPercentage}%`);

			const isExtendedPhase = fileProcessed === "Getting extended metadata...";
			const isOwnerPhase = fileProcessed === "Checking owners...";

			setFolderMessages((prev) => {
				let metadata: string;

				if (isExtendedPhase || isOwnerPhase) {
					metadata = `Finalizing extended metadata for ${folderName}`;
				} else if (fileProcessed) {
					metadata = `Gathering metadata ${fileProcessed} (${fileIdx}/${total}) for ${folderName}`;
				} else {
					metadata = `Processing ${folderName}`;
				}

				return {
					...prev,
					[source]: {
						...(prev[source] ?? {}),
						metadata,
					},
				};
			});
			// Update folder progress
			setFolders((prevRows) =>
				prevRows.map((row) =>
					row.folder === source && row.metadataProgress !== 100
						? { ...row, metadataProgress: progressPercentage }
						: row,
				),
			);
		};

		const handleMissingPath = (event: CustomEvent<{ path: string }>) => {
			const { path } = event.detail;
			console.log("[Metadata] Missing", path);
			setFolders((prevRows) =>
				prevRows.map((row) => (row.folder === path ? { ...row, invalidPath: true } : row)),
			);
		};

		const handleEmptyFolder = (event: CustomEvent<{ path: string }>) => {
			const { path } = event.detail;
			console.log("[Metadata] Empty folder", path);
			setFolders((prevRows) =>
				prevRows.map((row) => (row.folder === path ? { ...row, invalidPath: true } : row)),
			);
		};

		const handleNetworkPaused = (event: CustomEvent<{ source: string; error?: string }>) => {
			const { source } = event.detail;
			const folderName = source.split("\\").pop() ?? source;
			console.log(`[${folderName}] Metadata collection paused — waiting for network...`);
			setGlobalMessage(`Paused — waiting for network reconnect`);
		};

		const handleNetworkResumed = (event: CustomEvent<{ source: string }>) => {
			const { source } = event.detail;
			const folderName = source.split("\\").pop() ?? source;
			console.log(`[${folderName}] Network recovered, resuming metadata collection...`);
			setGlobalMessage(`Network reconnected, resuming`);
		};

		const handleStatus = (event: CustomEvent<{ source: string; message: string }>) => {
			const { message } = event.detail;
			console.log(`[Metadata] ${message}`);
			setGlobalMessage(message);
		};

		const handleCompletion = (
			event: CustomEvent<{
				source: string;
				success: boolean;
				metadata?: Record<string, unknown>;
				extendedMetadata?: Record<string, unknown>;
				fileCount?: number;
				error?: unknown;
			}>,
		) => {
			const {
				source,
				success,
				metadata: newMetadata,
				extendedMetadata: newExtendedMetadata,
				error,
			} = event.detail;

			if (success && newMetadata) {
				setMetadata((prev) => ({
					...prev,
					[source]: newMetadata[source],
				}));
				if (newExtendedMetadata) setExtendedMetadata(newExtendedMetadata);

				setFolders((prevRows) =>
					prevRows.map((row) =>
						row.folder === source
							? { ...row, metadataProgress: 100, metadataFailed: false }
							: row,
					),
				);
				setFolderMessages((prev) => ({
					...prev,
					[source]: { ...(prev[source] ?? {}), metadata: null },
				}));

				setRunningWorkers((prev) =>
					prev.filter((worker) => !(worker.folder === source && worker.type === "metadata")),
				);

				console.log(`Successfully processed folder metadata: ${source}`);
			} else {
				console.error(`Failed to process folder metadata: ${source}`, {
					success,
					metadata: newMetadata,
					error,
				});

				setRunningWorkers((prev) =>
					prev.filter((worker) => !(worker.folder === source && worker.type === "metadata")),
				);
				setFolderMessages((prev) => ({
					...prev,
					[source]: { ...(prev[source] ?? {}), metadata: "Metadata failed" },
				}));
				setFolders((prevRows) =>
					prevRows.map((row) =>
						row.folder === source ? { ...row, metadataFailed: true } : row,
					),
				);
			}
		};

		window.addEventListener("folder-metadata-progress", handleProgress as EventListener);
		window.addEventListener("folder-metadata-missing-path", handleMissingPath as EventListener);
		window.addEventListener("folder-metadata-empty-folder", handleEmptyFolder as EventListener);
		window.addEventListener("folder-metadata-paused", handleNetworkPaused as EventListener);
		window.addEventListener("folder-metadata-resumed", handleNetworkResumed as EventListener);
		window.addEventListener("folder-metadata-status", handleStatus as EventListener);
		window.addEventListener("folder-metadata-completion", handleCompletion as EventListener);

		return () => {
			window.removeEventListener("folder-metadata-progress", handleProgress as EventListener);
			window.removeEventListener(
				"folder-metadata-missing-path",
				handleMissingPath as EventListener,
			);
			window.removeEventListener(
				"folder-metadata-empty-folder",
				handleEmptyFolder as EventListener,
			);
			window.removeEventListener("folder-metadata-paused", handleNetworkPaused as EventListener);
			window.removeEventListener("folder-metadata-resumed", handleNetworkResumed as EventListener);
			window.removeEventListener("folder-metadata-status", handleStatus as EventListener);
			window.removeEventListener("folder-metadata-completion", handleCompletion as EventListener);
		};
	}, []);

	// Handle buffer progress and completion events
	useEffect(() => {
		const handleProgress = (event: CustomEvent<{ source: string; progressPercentage: number; fileProcessed?: string; currentFileIndex?: number; totalFiles?: number }>) => {
			const { source, progressPercentage, fileProcessed, currentFileIndex: fileIdx, totalFiles: total } = event.detail;
			const folderName = source.split("\\").pop() ?? source;
			console.log(`[${folderName}] Processing ${fileProcessed}... (${fileIdx}/${total}) - ${progressPercentage}%`);
			setFolderMessages((prev) => {
				const copy = fileProcessed
					? `Copying ${fileProcessed} (${fileIdx}/${total})`
					: "Copying";
				return {
					...prev,
					[source]: {
						...(prev[source] ?? {}),
						copy,
					},
				};
			});
			// Update folder progress
			setFolders((prevRows) =>
				prevRows.map((row) =>
					row.folder === source && row.bufferProgress !== 100
						? { ...row, bufferProgress: progressPercentage }
						: row,
				),
			);
		};

		const handleMissingPath = (event: CustomEvent<{ path: string }>) => {
			const { path } = event.detail;
			console.log("[Buffers] Missing", path);
			setFolders((prevRows) =>
				prevRows.map((row) => (row.folder === path ? { ...row, invalidPath: true } : row)),
			);
		};

		const handleEmptyFolder = (event: CustomEvent<{ path: string }>) => {
			const { path } = event.detail;
			console.log("[Buffers] Empty folder", path);
			setFolders((prevRows) =>
				prevRows.map((row) => (row.folder === path ? { ...row, invalidPath: true } : row)),
			);
		};

		const handleCompletion = (
			event: CustomEvent<{
				source: string;
				success: boolean;
				buffers?: FileBufferObj[];
				tempDir?: string;
				error?: unknown;
			}>,
		) => {
			const { source, success, buffers, tempDir, error } = event.detail;

			if (success && buffers && buffers.length > 0) {
				const sourceParts = source?.split("\\");
				const parentFolder = sourceParts[sourceParts.length - 1];

				setFolderBuffers((prev) => ({
					...prev,
					[parentFolder ?? source]: buffers,
				}));

				if (tempDir) {
					setTempDirs((prev) => [...prev, tempDir]);
				}

				setFolders((prevRows) =>
					prevRows.map((row) =>
						row.folder === source ? { ...row, bufferProgress: 100, bufferFailed: false } : row,
					),
				);
				setFolderMessages((prev) => ({
					...prev,
					[source]: { ...(prev[source] ?? {}), copy: null },
				}));

				setRunningWorkers((prev) =>
					prev.filter((worker) => !(worker.folder === source && worker.type === "buffer")),
				);

				console.log(`Successfully processed folder buffer: ${source}`);
			} else {
				console.error(`Failed to process folder buffer: ${source}`, {
					success,
					error,
				});

				setRunningWorkers((prev) =>
					prev.filter((worker) => !(worker.folder === source && worker.type === "buffer")),
				);
				setFolderMessages((prev) => ({
					...prev,
					[source]: { ...(prev[source] ?? {}), copy: "Copy failed" },
				}));
				setFolders((prevRows) =>
					prevRows.map((row) =>
						row.folder === source ? { ...row, bufferFailed: true } : row,
					),
				);
			}
		};

		const handleStatus = (event: CustomEvent<{ source: string; message: string }>) => {
			const { message } = event.detail;
			console.log(`[Buffers] ${message}`);
			setGlobalMessage(message);
		};

		const handleNetworkPaused = (event: CustomEvent<{ source: string; error?: string }>) => {
			const { source } = event.detail;
			const folderName = source.split("\\").pop() ?? source;
			console.log(`[${folderName}] Copy paused — waiting for network...`);
			setGlobalMessage(`Paused — waiting for network reconnect`);
			setFolderMessages((prev) => ({
				...prev,
				[source]: { ...(prev[source] ?? {}), copy: "Copy: Paused - waiting for network" },
			}));
		};

		const handleNetworkResumed = (event: CustomEvent<{ source: string }>) => {
			const { source } = event.detail;
			const folderName = source.split("\\").pop() ?? source;
			console.log(`[${folderName}] Network recovered, resuming copy...`);
			setGlobalMessage(`Network reconnected, resuming`);
			setFolderMessages((prev) => ({
				...prev,
				[source]: { ...(prev[source] ?? {}), copy: "Copy: Resuming" },
			}));
		};

		window.addEventListener("folder-buffer-progress", handleProgress as EventListener);
		window.addEventListener("folder-buffer-missing-path", handleMissingPath as EventListener);
		window.addEventListener("folder-buffer-empty-folder", handleEmptyFolder as EventListener);
		window.addEventListener("folder-buffer-status", handleStatus as EventListener);
		window.addEventListener("folder-buffer-paused", handleNetworkPaused as EventListener);
		window.addEventListener("folder-buffer-resumed", handleNetworkResumed as EventListener);
		window.addEventListener("folder-buffer-completion", handleCompletion as EventListener);

		return () => {
			window.removeEventListener("folder-buffer-progress", handleProgress as EventListener);
			window.removeEventListener("folder-buffer-missing-path", handleMissingPath as EventListener);
			window.removeEventListener("folder-buffer-empty-folder", handleEmptyFolder as EventListener);
			window.removeEventListener("folder-buffer-status", handleStatus as EventListener);
			window.removeEventListener("folder-buffer-paused", handleNetworkPaused as EventListener);
			window.removeEventListener("folder-buffer-resumed", handleNetworkResumed as EventListener);
			window.removeEventListener("folder-buffer-completion", handleCompletion as EventListener);
		};
	}, []);

	// Get folder metadata and buffers after file list uploaded
	useEffect(() => {
		if (foldersToProcess.length > 0) {
			const pathsToProcess = [...foldersToProcess];
			setFoldersToProcess([]); // Clear pending paths to avoid duplicates

			// Add to folders array
			const foldersToAdd = pathsToProcess
				.map((path, index) => {
					if (folders.some((row) => row.folder === path)) return;
					let uniqueID = folders.length + index;
					const existingIDs = new Set(folders.map((row) => row.id));

					while (existingIDs.has(uniqueID)) uniqueID++;

					// Initialize progress from cache if available
					const cached = cachedFoldersRef.current.find((c) => c.sourcePath === path);
					const metaProgress =
						cached && cached.totalFileCount && cached.processedCount !== undefined
							? cached.processedCount >= cached.totalFileCount
								? 100
								: Math.floor((cached.processedCount / cached.totalFileCount) * 100)
							: 0;

					return {
						id: uniqueID,
						folder: path,
						invalidPath: false,
						metadataProgress: metaProgress,
						bufferProgress: 0,
						metadataFailed: false,
						bufferFailed: false,
					};
				})
				.filter((row) => row !== undefined);
			setFolders((prev) => [...prev, ...foldersToAdd]);

			pathsToProcess.forEach((filePath) => {
				getFolderMetadata(filePath, setRunningWorkers).catch((error) =>
					console.error(`Failed to fetch metadata for folder ${filePath}:`, error),
				);
				getFolderBuffer(filePath, setRunningWorkers).catch((error) =>
					console.error(`Failed to fetch buffers for folder ${filePath}:`, error),
				);
			});
		}
	}, [foldersToProcess]);

	useEffect(() => {
		console.log("File list changed:", fileList);
		setCanLoseProgress(!!fileList);
		if (fileList) {
			const filename = fileList.name;
			const regex = /^(Digital_File_List|File\sList)/i;
			if (!regex.test(filename)) {
				// Filename doesnt match regex
				toast.error(Toast, {
					data: {
						success: false,
						title: "Invalid filename",
						message:
							"Your Digital File List file name must begin with 'Digital_File_List' or 'File List'. Please review that you have selected the correct file, or rename the file, then try uploading the file again.",
					},
				});
				console.log("Invalid file list filename:", filename);
				setFileList(null);
			}
		} else {
			resetStates();
			return;
		}

		parseFileList(fileList)
			.then((results) => {
				if (results.accession) {
					setAllowAccessionChange(false);
				}
				if (results.application) {
					setAllowApplicationChange(false);
				}

				setAccession(results.accession);
				setApplication(results.application);
				setFoldersToProcess(results.folders);
				setOriginalFolderList(results.foldersMetadata);
			})
			.catch((error) => {
				if (error instanceof Error) {
					const toastData = getXlsxFileListToastData(error.message);

					// Create a toast message
					console.log("Error parsing file list:", error.message);
					return toast.error(Toast, { data: toastData });
				}
				// Unexpected error
				console.error("Unexpected error parsing file list:", error);
				return toast.error(Toast, {
					data: {
						success: false,
						title: "Unexpected error",
						message: `Encountered an unexpected error while parsing your file list (ARS 662). Please contact someone from the DATS team for assistance. Error: ${error}`,
					},
				});
			});
	}, [fileList]);

	// Check for existing LAN transfer session on mount
	useEffect(() => {
		api.loadTransferSession("lan").then((session) => {
			setHasLanSession(!!session);
		});
	}, []);

	useEffect(() => {
		if (currentViewIndex === 0 && !fileList && cachedFolders.length > 0 && hasLanSession && !dismissedResumeModal) {
			setShowResumeModal(true);
		} else if (fileList || currentViewIndex > 0) {
			setShowResumeModal(false);
		}
	}, [currentViewIndex, fileList, cachedFolders, hasLanSession, dismissedResumeModal]);

	useEffect(() => {
		if (transferForm) {
			const filename = transferForm.name;
			const regex = /^(Transfer_Form|617)/i;
			if (!regex.test(filename)) {
				// Filename doesnt match regex
				toast.error(Toast, {
					data: {
						success: false,
						title: "Invalid filename",
						message:
							"Your Transfer Form ARS 617 file name must begin with 'Transfer_Form' or '617'. Please review that you have selected the correct file, or rename the file, then try uploading the file again.",
					},
				});
				console.log("Invalid transfer form filename:", filename);
				setTransferForm(null);
			}
		}
	}, [transferForm]);

	useEffect(() => {
		if (uploadSuccess === true) {
			// Success
			toast.success(Toast, {
				data: {
					success: true,
					title: "Folder upload successful",
					message:
						"Please verify all loaded folders should be sent to records, delete those that shouldn't be, then proceed to the next step.",
				},
			});
			console.log("Folder upload successful.");
		} else if (uploadSuccess === false) {
			// Failed to download transfer
			toast.error(Toast, {
				data: {
					success: false,
					title: "Folder upload unsuccessful",
					message:
						"One or more of your folders was not successfully uploaded due to an invalid folder path or empty folder. Update the folder path(s) by clicking the corresponding Edit icon or remove the folder by clicking the Delete icon. You may need to scroll within the table to locate the folders that have not loaded properly.",
				},
			});
			console.log("Folder upload unsuccessful.");
		}
	}, [uploadSuccess]);

	// Toast message once folders have been successfully uploaded
	useEffect(() => {
		if (
			currentViewIndex === 3 &&
			folders.length > 0 &&
			folders.every((folder) => folder.bufferProgress === 100 && folder.metadataProgress === 100) &&
			uploadSuccess !== true
		) {
			setUploadSuccess(true);
			setGlobalMessage(null);
		}
	}, [folders, currentViewIndex]);

	useEffect(() => {
		if (currentViewIndex === 3) {
			// Open of upload view
			if (folders.some((folder) => folder.invalidPath) && uploadSuccess !== false) {
				setUploadSuccess(false);
			}
		} else if (currentViewIndex === 4) {
			// Open of finish view
			setCanLoseProgress(false);
			handleSendRequest();
		}
	}, [currentViewIndex]);

	// Save transfer session on state changes
	useEffect(() => {
		if (currentViewIndex === 0 && !fileList) return; // Don't save before file list is selected
		if (currentViewIndex === 4) return; // Don't save on finish view

		const fileListPath = (fileList as File & { path?: string })?.path ?? null;
		const transferFormPath = (transferForm as File & { path?: string })?.path ?? null;

		api.saveTransferSession("lan", {
			currentViewIndex,
			accession,
			application,
			confirmAccAppChecked,
			submissionAgreementAccepted,
			fileListPath,
			fileListFilename: fileList?.name ?? null,
			transferFormPath,
			transferFormFilename: transferForm?.name ?? null,
			changes,
			changesJustification,
			foldersMetadata: originalFolderList,
		});
	}, [currentViewIndex, accession, application, confirmAccAppChecked, submissionAgreementAccepted, changes, changesJustification]);

	// Ask for justification of changes if any folder paths changed or deleted
	const handleLanUploadNextPress = () => {
		if (changes.length > 0) {
			// Folder paths changed or deleted
			setShowJustifyChangesModal(true);
		} else if (!accessToken) {
			// Prompt use to login
			setShowLoginRequiredModal(true);
		} else onNextPress();
	};

	const handleResumeContinue = async () => {
		if (!accessToken) {
			api.sso.startLoginProcess();
			return;
		}

		setDismissedResumeModal(true);

		// Try to restore session state
		const session = await api.loadTransferSession("lan") as LanTransferSession | null;
		if (session) {
			setAccession(session.accession);
			setApplication(session.application);
			setConfirmAccAppChecked(session.confirmAccAppChecked);
			setSubmissionAgreementAccepted(session.submissionAgreementAccepted ?? false);
			setChanges(session.changes ?? []);
			setChangesJustification(session.changesJustification ?? "");
			setOriginalFolderList(session.foldersMetadata ?? {});

			// Rehydrate file list from saved path
			if (session.fileListPath) {
				try {
					const { data, filename } = await api.readFileFromPath(session.fileListPath);
					const file = new File([data], filename);
					Object.defineProperty(file, 'path', { value: session.fileListPath, writable: false });
					setFileList(file);
				} catch {
					console.warn("Could not rehydrate file list from saved path:", session.fileListPath);
					toast.error(Toast, {
						data: {
							success: false,
							title: "File not found",
							message: `Could not find the file list at "${session.fileListPath}". Please re-select it.`,
						},
					});
				}
			}

			// Rehydrate transfer form from saved path
			if (session.transferFormPath) {
				try {
					const { data, filename } = await api.readFileFromPath(session.transferFormPath);
					const file = new File([data], filename);
					Object.defineProperty(file, 'path', { value: session.transferFormPath, writable: false });
					setTransferForm(file);
				} catch {
					console.warn("Could not rehydrate transfer form from saved path:", session.transferFormPath);
					toast.error(Toast, {
						data: {
							success: false,
							title: "File not found",
							message: `Could not find the transfer form at "${session.transferFormPath}". Please re-select it.`,
						},
					});
				}
			}

			// Jump to the saved step or at least past the file list step
			if (session.currentViewIndex > 0) {
				setCurrentViewIndex(Math.min(session.currentViewIndex, 3));
			}
		}

		// Process cached folders
		setFoldersToProcess((prev) => [...prev, ...cachedFolders.map((folder) => folder.sourcePath)]);
		setShowResumeModal(false);
	};

	const handleResumeStartFresh = async () => {
		await api.deleteTransferSession("lan");
		await clearAll();
		setShowResumeModal(false);
		setDismissedResumeModal(true);
	};

	const handleResumeClose = () => {
		setShowResumeModal(false);
		setDismissedResumeModal(true);
	};

	// Check if transfer exists
	const handleFileListUploadNextPress = () => {
		if (!accessToken) {
			// Prompt use to login
			setShowLoginRequiredModal(true);
		}

		checkForExistingTransfer({ accessToken, accession, application })
			.then((results) => {
				if (results.exists) {
					if (results.processed) {
						// Transfer already processed
						setShowTransferAlreadyProcessedModal(true);
					} else {
						// Transfer already sent
						setShowTransferAlreadySentModal(true);
					}
					setConfirmAccAppChecked(false);
				} else {
					// No existing transfer, proceed to next step
					onNextPress();
				}
			})
			.catch((error) => {
				console.error("Error checking for existing transfer:", error);
				toast.error(Toast, {
					data: {
						success: false,
						title: "Error checking transfer",
						message: "An error occurred while checking for existing transfers. Please try again.",
					},
				});
			});
	};

	const handleSendRequest = async () => {
		if (!fileList || !transferForm || !accessToken) return;

		// Request url
		const apiUrl = await api.getCurrentApiUrl();
		const requestUrl = `${apiUrl}/transfer/lan`;

    setLoadingMessage("Preparing transfer request...");

		// Get updated folder metadata
		const updatedFolderList: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(originalFolderList)) {
			const change = changes.find((c) => c.originalFolderPath === key);
			if (change) {
				if (!change.deleted) {
					const newKey = change.newFolderPath ?? key;
					updatedFolderList[newKey] = value;
				}
			} else {
				updatedFolderList[key] = value;
			}
		}

		// Prepare metadata V2 for request body
		const metadataV2 = {
			admin: { accession, application },
			folders: updatedFolderList,
			files: metadata,
		};

		// Read static buffers
		const fileListBuffer = await api.utils.fileToBuffer(fileList);
		const transferFormBuffer = await api.utils.fileToBuffer(transferForm);

		// Normalize and reconstruct buffer structure
		const reconstructedBuffers: typeof folderBuffers = {};
		for (const [folder, files] of Object.entries(folderBuffers)) {
			reconstructedBuffers[folder] = files.map((file) => ({
				filename: file.filename,
				path: file.path,
				filePath: file.filePath,
				size: file.size,
			}));
		}

    setLoadingMessage("Packaging transfer request...");

		// Generate zipped chunks and checksum
		const { chunks: zipChunks, checksum: contentChecksum } =
			await api.transfer.createZippedChunks(reconstructedBuffers);
		const totalChunks = zipChunks.length;

		for (let i = 0; i < totalChunks; i++) {
			const chunk = zipChunks[i];
			const formData = new FormData();

			formData.append("fileListBuffer", new Blob([fileListBuffer]), "file.bin");
			formData.append("fileListFilename", fileList.name);
			formData.append("transferFormBuffer", new Blob([transferFormBuffer]), "file.bin");
			formData.append("transferFormFilename", transferForm.name);
			formData.append("contentZipChunk", new Blob([chunk]), "file.bin");
			formData.append("chunkIndex", i.toString());
			formData.append("totalChunks", totalChunks.toString());
			formData.append("contentChecksum", contentChecksum);
			formData.append("metadataV2", JSON.stringify(metadataV2));
			formData.append("extendedMetadata", JSON.stringify(extendedMetadata));
			formData.append("changes", JSON.stringify(changes));
			formData.append("changesJustification", changesJustification);

			try {
				const tokens = await refresh(); // Get new tokens before request
				console.log(`Uploading chunk ${i + 1} of ${totalChunks}`);

        if (i === totalChunks - 1) {
          // Last chunk
          setLoadingMessage("Processing your request. For large uploads, this may take a while...");
        } else {
          setLoadingMessage(`Sending part ${i + 1} of ${totalChunks}...`);
        }

				const response = await fetch(requestUrl, {
					method: "POST",
					headers: { Authorization: `Bearer ${tokens?.accessToken}` },
					body: formData,
				});

				if (!response.ok) {
					console.error(`Upload failed for chunk ${i + 1}`);
					setRequestSuccessful(false);
          setLoadingMessage(null);
					return;
				}

				const jsonResponse = await response.json();
				console.log("Lan transfer response:", jsonResponse);

				if (jsonResponse.success && i === totalChunks - 1) {
          setLoadingMessage(null);
					setRequestSuccessful(true);
					folders.forEach((folder) => {
						window.api.deleteMetadataState(folder.folder);
						window.api.deleteCopyState(folder.folder);
					});
					tempDirs.forEach((dir) => window.api.deleteTempDir(dir));
					setTempDirs([]);
					api.deleteTransferSession("lan");
				}
			} catch (error) {
				console.error("Lan transfer error:", error);
				setRequestSuccessful(false);
        setLoadingMessage(null);
				return;
			}
		}

		console.log("All chunks uploaded successfully.");
	};

	// Send to home on completion
	const handleCompletion = () => {
		setCanLoseProgress(false);
		navigate("/");
	};

	const handleRetrySubmission = () => {
		handleLogout();
		setRequestSuccessful(null);
		setCurrentViewIndex(3);
	};

	return (
		<Grid container sx={{ paddingBottom: "20px" }}>
			<Grid size={2} />
			<Grid size={8} sx={{ paddingTop: 3 }}>
				<Stack gap={3}>
					<Typography variant="h2">Send records from LAN Drive</Typography>
					<Stepper
						items={["File list", "Transfer form", "Submission agreement", "Confirmation", "Finish"]}
						currentIndex={currentViewIndex}
					/>
					{currentViewIndex === 0 && (
						<LanUploadFileListView
							file={fileList}
							setFile={setFileList}
							accession={accession}
							setAccession={setAccession}
							allowAccessionChange={allowAccessionChange}
							setApplication={setApplication}
							application={application}
							allowApplicationChange={allowApplicationChange}
							confirmChecked={confirmAccAppChecked}
							setConfirmChecked={setConfirmAccAppChecked}
							onNextPress={handleFileListUploadNextPress}
						/>
					)}
					{currentViewIndex === 1 && (
						<LanUploadTransferFormView
							file={transferForm}
							setFile={setTransferForm}
							onNextPress={onNextPress}
							onBackPress={onBackPress}
						/>
					)}
				{currentViewIndex === 2 && (
					<LanSubmissionAgreementView
						accession={accession!}
						application={application!}
						accept={submissionAgreementAccepted}
						setAccept={setSubmissionAgreementAccepted}
						onNextPress={onNextPress}
						onBackPress={onBackPress}
					/>
				)}
				{currentViewIndex === 3 && (
				<LanConfirmationView
					accession={accession!}
					application={application!}
					folders={folders}
					setFolders={setFolders}
					processRowUpdate={handleRowUpdate}
					setMetadata={setMetadata}
					setChanges={setChanges}
					folderMessages={folderMessages}
					globalMessage={globalMessage}
					setFolderMessages={setFolderMessages}
					onFolderEdit={handleEditClick}
					onNextPress={handleLanUploadNextPress}
					onBackPress={onBackPress}
					handleShutdownWorker={handleShutdownWorker}
				/>
				)}
					{currentViewIndex === 4 && (
						<FinishView
							accession={accession!}
							application={application!}
							wasRequestSuccessful={requestSuccessful}
							onNextPress={handleCompletion}
							handleRetrySubmission={handleRetrySubmission}
							isLan={true}
              loadingMessage={loadingMessage}
						/>
					)}
					<JustifyChangesModal
						open={showJustifyChangesModal}
						onClose={() => setShowJustifyChangesModal(false)}
						explanation={changesJustification}
						setExplanation={setChangesJustification}
						onConfirm={() => {
							setShowJustifyChangesModal(false);
							if (!accessToken) {
								// Prompt user to login
								setShowLoginRequiredModal(true);
							} else onNextPress();
						}}
					/>
					<LoginRequiredModal
						open={showLoginRequiredModal}
						onClose={() => setShowLoginRequiredModal(false)}
						onConfirm={() => {
							setShowLoginRequiredModal(false);
							api.sso.startLoginProcess();
						}}
					/>
					<TransferAlreadyProcessedModal
						open={showTransferAlreadyProcessedModal}
						onClose={() => setShowTransferAlreadyProcessedModal(false)}
						accession={accession!}
						application={application!}
					/>
					<TransferAlreadySentModal
						open={showTransferAlreadySentModal}
						onClose={() => setShowTransferAlreadySentModal(false)}
						accession={accession!}
						application={application!}
						onConfirm={() => {
							setShowTransferAlreadySentModal(false);
							onNextPress();
						}}
					/>
					<ResumeSessionModal
						open={showResumeModal}
						cachedFolders={cachedFolders}
						isAuthenticated={!!accessToken}
						onContinue={handleResumeContinue}
						onStartFresh={handleResumeStartFresh}
						onClose={handleResumeClose}
					/>
				</Stack>
			</Grid>
			<Grid size={2} />
		</Grid>
	);
};
