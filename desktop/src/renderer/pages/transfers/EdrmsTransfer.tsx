import { useAuth, useMetadataCache, useNavigate } from "@/renderer/hooks";
import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import { ResumeSessionModal, Stepper, Toast } from "@renderer/components";
import {
	EdrmsConfirmationView,
	EdrmsSubmissionAgreementView,
	EdrmsUploadDataportView,
	EdrmsUploadFilelistView,
	EdrmsUploadFolderView,
	EdrmsUploadTransferFormView,
} from "@renderer/components/transfer/edrms-views";
import { FinishView } from "@renderer/components/transfer/finish-view";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export const EdrmsTransferPage = () => {
	const [api] = useState(window.api); // Preload scripts

	const { navigate, setCanLoseProgress } = useNavigate();
	const { idToken, accessToken, refresh } = useAuth();

	const { cachedFolders, clearAll } = useMetadataCache();

	const handleLogout = async () => await api.sso.logout(idToken);

	const [currentViewIndex, setCurrentViewIndex] = useState(0);
	const [showResumeModal, setShowResumeModal] = useState(false);
	const [dismissedResumeModal, setDismissedResumeModal] = useState(false);
	const [hasEdrmsSession, setHasEdrmsSession] = useState(false);
	const [folderPath, setFolderPath] = useState<string | null | undefined>(null);
	const [fileList, setFileList] = useState<File | null | undefined>(undefined);
	const [fileListFoundInEdrms, setFileListFoundInEdrms] = useState<boolean>(false);
	const [dataportFile, setDataportFile] = useState<File | null | undefined>(undefined);
	const [dataportFoundInEdrms, setDataportFoundInEdrms] = useState<boolean>(false);
	const [transferForm, setTransferForm] = useState<File | null | undefined>(undefined);
	const [transferFormFoundInEdrms, setTransferFormFoundInEdrms] = useState<boolean>(false);
	const [dataportJson, setDataportJson] = useState<Record<string, string>[] | null>(null);
	const [metadata, setMetadata] = useState<Record<string, unknown>>({});

	// Pulled from dataport file
	const [accession, setAccession] = useState<string>("");
	const [application, setApplication] = useState<string>("");

	// User confirms if accession & application are correct
	const [confirmAccAppChecked, setConfirmAccAppChecked] = useState<boolean>(false);
	const [submissionAgreementAccepted, setSubmissionAgreementAccepted] = useState<boolean>(false);

	// Dataport reading state
	const [isReadingDataport, setIsReadingDataport] = useState(false);

	// Buffer progress
	const [bufferProgress, setBufferProgress] = useState<number>(0);
	const [folderBuffers, setFolderBuffers] = useState<Record<string, FileBufferObj[]>>({});
	const [tempDirs, setTempDirs] = useState<string[]>([]);
	const [currentFile, setCurrentFile] = useState<string | null>(null);
	const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
	const [totalFiles, setTotalFiles] = useState<number>(0);

	// Metadata progress
	const [metadataProgress, setMetadataProgress] = useState<number>(0);
	const [metadataCurrentFile, setMetadataCurrentFile] = useState<string | null>(null);
	const [metadataFileIndex, setMetadataFileIndex] = useState<number>(0);
	const [metadataTotalFiles, setMetadataTotalFiles] = useState<number>(0);
	const [processingMessage, setProcessingMessage] = useState<string | null>(null);

	// Request to send transfer
	const [requestSuccessful, setRequestSuccessful] = useState<boolean | null>(null);

	// Allows buffer collection to use metadata without issues of stale state
	const metadataRef = useRef(metadata);

	const onNextPress = () => {
		setCurrentViewIndex((prev) => prev + 1);
	};

	const onBackPress = () => {
		setCurrentViewIndex((prev) => prev - 1);
	};

	// Handle buffer progress and completion events
	useEffect(() => {
		const handleProgress = (event: CustomEvent<{ source: string; progressPercentage: number; fileProcessed?: string; currentFileIndex?: number; totalFiles?: number }>) => {
			const { source, progressPercentage, fileProcessed, currentFileIndex: fileIdx, totalFiles: total } = event.detail;
			console.log(`[${source}] Processing ${fileProcessed}... (${fileIdx}/${total}) - ${progressPercentage}%`);
			const currentProgress = bufferProgress;

			if (currentProgress !== 100) {
				setBufferProgress(progressPercentage);
				setCurrentFile(fileProcessed ?? null);
				setCurrentFileIndex(fileIdx ?? 0);
				setTotalFiles(total ?? 0);
			}
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
				let folderBuffers = {};

				buffers.forEach((buffer) => {
					const bufferFilename = buffer.filename;
					const fileMetadata = metadataRef.current.files as Record<string, unknown[]>;
					let fileFound = false;

					// Find file match in metadata.files
					Object.entries(fileMetadata as Record<string, unknown[]>).forEach(
						([folderName, value]) => {
							const file = value.find(
								(f) => (f as { filename: string }).filename === bufferFilename,
							) as { filename: string };

							if (file && !fileFound) {
								folderBuffers = {
									...folderBuffers,
									[folderName]: [...(folderBuffers[folderName] ?? []), buffer],
								};
								fileFound = true;
							}
						},
					);
				});

				setFolderBuffers(folderBuffers);
				if (tempDir) {
					setTempDirs((prev) => [...prev, tempDir]);
				}
				console.log(`Successfully processed folder buffer: ${source}`);
			} else {
				console.error(`Failed to process folder buffer: ${source}`, {
					success,
					error,
				});
			}
		};

		const handleNetworkPaused = (event: CustomEvent<{ source: string; error?: string }>) => {
			const { source } = event.detail;
			console.log(`[Buffers] Copy paused for ${source} — waiting for network...`);
		};

		const handleNetworkResumed = (event: CustomEvent<{ source: string }>) => {
			const { source } = event.detail;
			console.log(`[Buffers] Network recovered, resuming copy for ${source}...`);
		};

		window.addEventListener("folder-buffer-progress", handleProgress as EventListener);
		window.addEventListener("folder-buffer-paused", handleNetworkPaused as EventListener);
		window.addEventListener("folder-buffer-resumed", handleNetworkResumed as EventListener);
		window.addEventListener("folder-buffer-completion", handleCompletion as EventListener);

		return () => {
			window.removeEventListener("folder-buffer-progress", handleProgress as EventListener);
			window.removeEventListener("folder-buffer-paused", handleNetworkPaused as EventListener);
			window.removeEventListener("folder-buffer-resumed", handleNetworkResumed as EventListener);
			window.removeEventListener("folder-buffer-completion", handleCompletion as EventListener);
		};
	}, []);

	// Handle metadata progress and completion events
	useEffect(() => {
		const handleMetadataProgress = (event: CustomEvent<{ source: string; progressPercentage: number; fileProcessed?: string; currentFileIndex?: number; totalFiles?: number }>) => {
			const { source, progressPercentage, fileProcessed, currentFileIndex: fileIdx, totalFiles: total } = event.detail;
			const folderName = source.split("\\").pop() ?? source;
			console.log(`[${folderName}] Processing metadata for ${fileProcessed}... (${fileIdx}/${total}) - ${progressPercentage}%`);

			setMetadataProgress(progressPercentage);
			setMetadataCurrentFile(fileProcessed ?? null);
			setMetadataFileIndex(fileIdx ?? 0);
			setMetadataTotalFiles(total ?? 0);
		};

		const handleMetadataCompletion = (
			event: CustomEvent<{
				source: string;
				success: boolean;
				metadata?: Record<string, unknown>;
				extendedMetadata?: Record<string, unknown>;
				error?: unknown;
			}>,
		) => {
			const { source, success, error } = event.detail;
			if (success) {
				setMetadataProgress(100);
				console.log(`Successfully processed folder metadata: ${source}`);
			} else {
				console.error(`Failed to process folder metadata: ${source}`, { success, error });
			}
		};

		const handleMetadataPaused = (event: CustomEvent<{ source: string; error?: string }>) => {
			const { source } = event.detail;
			console.log(`[Metadata] Paused for ${source} — waiting for network...`);
		};

		const handleMetadataResumed = (event: CustomEvent<{ source: string }>) => {
			const { source } = event.detail;
			console.log(`[Metadata] Network recovered, resuming for ${source}...`);
		};

		window.addEventListener("folder-metadata-progress", handleMetadataProgress as EventListener);
		window.addEventListener("folder-metadata-completion", handleMetadataCompletion as EventListener);
		window.addEventListener("folder-metadata-paused", handleMetadataPaused as EventListener);
		window.addEventListener("folder-metadata-resumed", handleMetadataResumed as EventListener);

		return () => {
			window.removeEventListener("folder-metadata-progress", handleMetadataProgress as EventListener);
			window.removeEventListener("folder-metadata-completion", handleMetadataCompletion as EventListener);
			window.removeEventListener("folder-metadata-paused", handleMetadataPaused as EventListener);
			window.removeEventListener("folder-metadata-resumed", handleMetadataResumed as EventListener);
		};
	}, []);

	// Build combined processing message from buffer and metadata progress
	useEffect(() => {
		if (bufferProgress === 0 && metadataProgress === 0) {
			setProcessingMessage(null);
			return;
		}

		// Both complete — clear the banner
		if (bufferProgress === 100 && metadataProgress === 100) {
			setProcessingMessage(null);
			return;
		}

		const folderName = folderPath?.split("\\").pop() ?? folderPath ?? "";
		const parts: string[] = [];

		if (bufferProgress > 0 && bufferProgress < 100 && currentFile) {
			parts.push(`Copying ${currentFile} (${currentFileIndex}/${totalFiles}) for ${folderName}`);
		}

		if (metadataProgress > 0 && metadataProgress < 100) {
			const isExtendedPhase = metadataCurrentFile === "Getting extended metadata...";
			const isOwnerPhase = metadataCurrentFile === "Checking owners...";
			if (isExtendedPhase || isOwnerPhase) {
				parts.push(`Finalizing extended metadata for ${folderName}`);
			} else if (metadataCurrentFile) {
				parts.push(`Gathering metadata ${metadataCurrentFile} (${metadataFileIndex}/${metadataTotalFiles}) for ${folderName}`);
			} else {
				parts.push(`Processing ${folderName}`);
			}
		}

		if (parts.length > 0) {
			setProcessingMessage(parts.join(", "));
		}
	}, [bufferProgress, metadataProgress, currentFile, currentFileIndex, totalFiles, metadataCurrentFile, metadataFileIndex, metadataTotalFiles, folderPath]);

	const parseEdrmsFiles = async (folderPath: string) => {
		const {
			dataport: parsedDataport,
			fileList: parsedFileList,
			transferForm: parsedTransferForm,
		} = await api.transfer.parseEdrmsFiles(folderPath);
		// Dataport found
		if (parsedDataport && !dataportFile) {
			setDataportFile(parsedDataport);
			setDataportFoundInEdrms(true);
		}
		// Filelist found
		if (parsedFileList && !fileList) {
			setFileList(parsedFileList);
			setFileListFoundInEdrms(true);
		}
		// Transfer form found
		if (parsedTransferForm && !transferForm) {
			setTransferForm(parsedTransferForm);
			setTransferFormFoundInEdrms(true);
		}
	};

	const parseDataport = async (dataportFile: File) => {
		setIsReadingDataport(true);

		// Parse file to json
		try {
			const dataportJson = await api.transfer.parseTabDelimitedTxt(dataportFile);
			setDataportJson(dataportJson);

			if (!folderPath) throw new Error("Missing folder path while parsing dataport file.");

			// Parse json into admin, folders, and files metadata
			const metadata = await api.transfer.parseDataportJsonMetadata(dataportJson, folderPath);

			setMetadata(metadata);
			setAccession(metadata.admin.accession);
			setApplication(metadata.admin.application);
		} catch (error) {
			console.error(error);

      if (error instanceof Error && error.message.startsWith("Failed to read file")) {
        toast.error(Toast, {
				data: {
					success: false,
					title: "Failed to read file",
					message:
						`${error.message}. Please review the file.`,
				},
			});
			console.log("Failed to read file:", error);
      } else if (error instanceof Error && error.message.startsWith("A file mentioned in your Dataport file could not be found on your system.")) {
		toast.error(Toast, {
				data: {
					success: false,
					title: "File not found",
					message:
						`${error.message}. Please ensure the file is included in your EDRMS folder upload. See "View > Toggle Developer Tools" for more details.`,
				},
			});
			console.log("File mentioned in dataport not found:", error);
	  } else {
        toast.error(Toast, {
				data: {
					success: false,
					title: "Dataport parse failed",
					message:
						"Your dataport file could not be parsed. Please be sure to only upload dataport files generated by the EDRMS system.",
				},
			});
			console.log("Dataport parse failed:", error);
      }

			setDataportFile(null);
      setDataportFoundInEdrms(false);
		} finally {
			setIsReadingDataport(false);
		}
	};

	const getFolderBuffer = async (filePath: string) => {
		try {
			await api.workers.getFolderBuffer({
				filePath,
			});
		} catch (error) {
			console.error(`Failed to fetch buffers for folder ${filePath}:`, error);
		}
	};

	useEffect(() => {
		setCanLoseProgress(!!folderPath);
		if (folderPath) {
			// Check for edrms files when a new folder is chosen
			parseEdrmsFiles(folderPath);
		} else {
      // Reset
      setDataportFile(null);
      setFileList(null);
      setTransferForm(null);
      setDataportFoundInEdrms(false);
      setFileListFoundInEdrms(false);
      setTransferFormFoundInEdrms(false);
      setMetadata({});
    }
	}, [folderPath]);

	useEffect(() => {
		if (folderPath && metadata.files) {
			// After metadata has been collected
			metadataRef.current = metadata;
			// Copy buffers from folder
			getFolderBuffer(folderPath);
		}
	}, [metadata.files]);

	useEffect(() => {
		if (dataportFile) {
			parseDataport(dataportFile);
		} else {
			// Reset
			setIsReadingDataport(false);
			setDataportFoundInEdrms(false);
			setMetadata({});
			metadataRef.current = {};
			setFolderBuffers({});
			setDataportJson(null);
			setAccession("");
			setApplication("");
			setConfirmAccAppChecked(false);
		}
	}, [dataportFile]);

	useEffect(() => {
		if (!fileList) {
			// Reset
			setFileListFoundInEdrms(false);
		}
	}, [fileList]);

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
		} else {
			// Reset
			setTransferFormFoundInEdrms(false);
		}
	}, [transferForm]);

	useEffect(() => {
		if (currentViewIndex === 1) {
			// Open of upload dataport view
			if (dataportFoundInEdrms) {
				toast.success(Toast, {
					data: {
						success: true,
						title: "Dataport file detected",
						message:
							"We have automatically populated your dataport file by scanning the EDRMS folder you uploaded in the previous step.",
					},
				});
				console.log("Dataport file detected in EDRMS folder.");
			}
		} else if (currentViewIndex === 2) {
			// Open of upload filelist view
			if (fileListFoundInEdrms) {
				toast.success(Toast, {
					data: {
						success: true,
						title: "Filelist file detected",
						message:
							"We have automatically populated your filelist file by scanning the EDRMS folder you uploaded in the previous step.",
					},
				});
				console.log("Filelist file detected in EDRMS folder.");
			}
		} else if (currentViewIndex === 3) {
			// Open of upload transfer form view
			if (transferFormFoundInEdrms) {
				toast.success(Toast, {
					data: {
						success: true,
						title: "Transfer form detected",
						message:
							"We have automatically populated your transfer form by scanning the EDRMS folder you uploaded in the previous step.",
					},
				});
				console.log("Transfer form detected in EDRMS folder.");
			}
		} else if (currentViewIndex === 6) {
			setCanLoseProgress(false);
			// Open of finish view
			handleSendRequest();
		}
	}, [currentViewIndex]);

	// Save transfer session on state changes
	useEffect(() => {
		if (!folderPath) return;
		if (currentViewIndex === 6) return;

		api.saveTransferSession("edrms", {
			currentViewIndex,
			accession,
			application,
			confirmAccAppChecked,
			submissionAgreementAccepted,
			folderPath: folderPath ?? null,
			dataportPath: (dataportFile as File & { path?: string })?.path ?? null,
			dataportFilename: dataportFile?.name ?? null,
			fileListPath: (fileList as File & { path?: string })?.path ?? null,
			fileListFilename: fileList?.name ?? null,
			transferFormPath: (transferForm as File & { path?: string })?.path ?? null,
			transferFormFilename: transferForm?.name ?? null,
		});
	}, [currentViewIndex, accession, application, confirmAccAppChecked, submissionAgreementAccepted, folderPath]);

	const handleSendRequest = async () => {
		if (!dataportFile || !fileList || !transferForm || !accessToken) return;

		// Request URL
		const apiUrl = await api.getCurrentApiUrl();
		const requestUrl = `${apiUrl}/transfer/edrms`;

		// Prepare buffers for static files
		const dataportBuffer = await api.utils.fileToBuffer(dataportFile);
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

		const finalMetadata = {
			...metadata,
			admin: {
				...(metadata.admin as Record<string, unknown>),
				accession,
				application,
			},
		};

		// Generate zipped chunks and checksum
		const { chunks: zipChunks, checksum: contentChecksum } =
			await api.transfer.createZippedChunks(reconstructedBuffers);

		const totalChunks = zipChunks.length;

		for (let index = 0; index < totalChunks; index++) {
			const chunk = zipChunks[index];
			const formData = new FormData();

			formData.append("dataportBuffer", new Blob([dataportBuffer]), "file.bin");
			formData.append("dataportFilename", dataportFile.name);
			formData.append("fileListBuffer", new Blob([fileListBuffer]), "file.bin");
			formData.append("fileListFilename", fileList.name);
			formData.append("transferFormBuffer", new Blob([transferFormBuffer]), "file.bin");
			formData.append("transferFormFilename", transferForm.name);
			formData.append("contentZipChunk", new Blob([chunk]), "file.bin");
			formData.append("chunkIndex", index.toString());
			formData.append("totalChunks", totalChunks.toString());
			formData.append("contentChecksum", contentChecksum);
			formData.append("metadata", JSON.stringify(finalMetadata));
			formData.append("extendedMetadata", JSON.stringify({ folders: dataportJson }));

			try {
				const tokens = await refresh(); // Get new tokens before request
				console.log(`Uploading chunk ${index + 1} of ${totalChunks}`);
				const response = await fetch(requestUrl, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${tokens?.accessToken}`,
					},
					body: formData,
				});

				if (!response.ok) {
					console.error(`Upload failed for chunk ${index + 1}`);
					setRequestSuccessful(false);
					return;
				}

				const jsonResponse = await response.json();
				console.log("EDRMS transfer response:", jsonResponse);

				if (jsonResponse.success && index === totalChunks - 1) {
					setRequestSuccessful(true);
					if (folderPath) {
						window.api.deleteMetadataState(folderPath);
						window.api.deleteCopyState(folderPath);
					}
					tempDirs.forEach((dir) => window.api.deleteTempDir(dir));
					setTempDirs([]);
					api.deleteTransferSession("edrms");
				}
			} catch (error) {
				console.error("EDRMS transfer error:", error);
				setRequestSuccessful(false);
				return;
			}
		}

		console.log("All EDRMS chunks uploaded successfully.");
	};

	const handleResumeContinue = async () => {
		if (!accessToken) {
			api.sso.startLoginProcess();
			return;
		}

		setDismissedResumeModal(true);

		// Try to restore session state
		const session = await api.loadTransferSession("edrms") as EdrmsTransferSession | null;
		if (session) {
			setAccession(session.accession);
			setApplication(session.application);
			setConfirmAccAppChecked(session.confirmAccAppChecked);
			setSubmissionAgreementAccepted(session.submissionAgreementAccepted ?? false);

			// Rehydrate dataport file from saved path
			if (session.dataportPath) {
				try {
					const { data, filename } = await api.readFileFromPath(session.dataportPath);
					const file = new File([data], filename);
					Object.defineProperty(file, 'path', { value: session.dataportPath, writable: false });
					setDataportFile(file);
				} catch {
					console.warn("Could not rehydrate dataport from saved path:", session.dataportPath);
				}
			}

			// Rehydrate file list from saved path
			if (session.fileListPath) {
				try {
					const { data, filename } = await api.readFileFromPath(session.fileListPath);
					const file = new File([data], filename);
					Object.defineProperty(file, 'path', { value: session.fileListPath, writable: false });
					setFileList(file);
				} catch {
					console.warn("Could not rehydrate file list from saved path:", session.fileListPath);
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
				}
			}

			if (session.folderPath) {
				setFolderPath(session.folderPath);
			}

			// Jump to the saved step or at least past the folder step
			if (session.currentViewIndex > 0) {
				setCurrentViewIndex(Math.min(session.currentViewIndex, 5));
			}
		} else {
			const firstCachedFolder = cachedFolders[0]?.sourcePath;
			if (firstCachedFolder) setFolderPath(firstCachedFolder);
		}

		setShowResumeModal(false);
	};

	const handleResumeStartFresh = async () => {
		await api.deleteTransferSession("edrms");
		await clearAll();
		setShowResumeModal(false);
		setDismissedResumeModal(true);
	};

	const handleResumeClose = () => {
		setShowResumeModal(false);
		setDismissedResumeModal(true);
	};

	// Check for existing EDRMS transfer session on mount
	useEffect(() => {
		api.loadTransferSession("edrms").then((session) => {
			setHasEdrmsSession(!!session);
		});
	}, []);

	useEffect(() => {
		if (currentViewIndex === 0 && !folderPath && cachedFolders.length > 0 && hasEdrmsSession && !dismissedResumeModal) {
			setShowResumeModal(true);
		} else if (folderPath || currentViewIndex > 0) {
			setShowResumeModal(false);
		}
	}, [currentViewIndex, folderPath, cachedFolders, hasEdrmsSession, dismissedResumeModal]);

	// Send to home on completion
	const handleCompletion = () => {
		setCanLoseProgress(false);
		navigate("/");
	};

	const handleRetrySubmission = () => {
		handleLogout();
		setRequestSuccessful(null);
		setCurrentViewIndex(5);
	};

	return (
		<Grid container sx={{ paddingBottom: "20px" }}>
			<Grid size={2} />
			<Grid size={8} sx={{ paddingTop: 3 }}>
				<Stack gap={3}>
					<Typography variant="h2">Send records from EDRMS</Typography>
					<Stepper
						items={[
							"EDRMS",
							"Dataport file",
							"File list",
							"Transfer form",
							"Submission agreement",
							"Confirmation",
							"Finish",
						]}
						currentIndex={currentViewIndex}
					/>
					{currentViewIndex === 0 && (
						<EdrmsUploadFolderView
							folderPath={folderPath}
							setFolderPath={setFolderPath}
							onNextPress={onNextPress}
						/>
					)}
					{currentViewIndex === 1 && (
						<EdrmsUploadDataportView
							file={dataportFile}
							setFile={setDataportFile}
							accession={accession}
							application={application}
							confirmChecked={confirmAccAppChecked}
							setConfirmChecked={setConfirmAccAppChecked}
							setAccession={setAccession}
							setApplication={setApplication}
							isReadingDataport={isReadingDataport}
							onNextPress={onNextPress}
							onBackPress={onBackPress}
						/>
					)}
					{currentViewIndex === 2 && (
						<EdrmsUploadFilelistView
							file={fileList}
							setFile={setFileList}
							onNextPress={onNextPress}
							onBackPress={onBackPress}
						/>
					)}
					{currentViewIndex === 3 && (
						<EdrmsUploadTransferFormView
							file={transferForm}
							setFile={setTransferForm}
							onNextPress={onNextPress}
							onBackPress={onBackPress}
						/>
					)}
				{currentViewIndex === 4 && (
					<EdrmsSubmissionAgreementView
						accession={accession!}
						application={application!}
						accept={submissionAgreementAccepted}
						setAccept={setSubmissionAgreementAccepted}
						onNextPress={onNextPress}
						onBackPress={onBackPress}
					/>
				)}
					{currentViewIndex === 5 && (
						<EdrmsConfirmationView
							accession={accession!}
							application={application!}
							bufferProgress={bufferProgress}
							folderPath={folderPath!}
							processingMessage={processingMessage}
							onNextPress={onNextPress}
							onBackPress={onBackPress}
						/>
					)}
					{currentViewIndex === 6 && (
						<FinishView
							accession={accession!}
							application={application!}
							wasRequestSuccessful={requestSuccessful}
							onNextPress={handleCompletion}
							handleRetrySubmission={handleRetrySubmission}
							isLan={false}
						/>
					)}
				</Stack>
			</Grid>
			<Grid size={2} />
			<ResumeSessionModal
				open={showResumeModal}
				cachedFolders={cachedFolders}
				isAuthenticated={!!accessToken}
				onContinue={handleResumeContinue}
				onStartFresh={handleResumeStartFresh}
				onClose={handleResumeClose}
			/>
		</Grid>
	);
};
