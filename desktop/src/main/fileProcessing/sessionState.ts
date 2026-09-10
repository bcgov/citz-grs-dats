import { promises as fsPromises } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const { writeFile, readFile, unlink, mkdir, rename } = fsPromises;

export type TransferType = "lan" | "edrms";

export type LanTransferSession = {
  type: "lan";
  currentViewIndex: number;
  accession: string;
  application: string;
  confirmAccAppChecked: boolean;
  submissionAgreementAccepted: boolean;
  fileListPath: string | null;
  fileListFilename: string | null;
  transferFormPath: string | null;
  transferFormFilename: string | null;
  changes: Array<{
    originalFolderPath: string;
    newFolderPath?: string;
    deleted: boolean;
  }>;
  changesJustification: string;
  foldersMetadata: Record<string, unknown>;
};

export type EdrmsTransferSession = {
  type: "edrms";
  currentViewIndex: number;
  accession: string;
  application: string;
  confirmAccAppChecked: boolean;
  submissionAgreementAccepted: boolean;
  folderPath: string | null;
  dataportPath: string | null;
  dataportFilename: string | null;
  fileListPath: string | null;
  fileListFilename: string | null;
  transferFormPath: string | null;
  transferFormFilename: string | null;
};

export type TransferSession = LanTransferSession | EdrmsTransferSession;

const getSessionFilePath = (
  sessionDir: string,
  type: TransferType
): string => path.join(sessionDir, `dats-transfer-session-${type}.json`);

export const saveTransferSession = async (
  sessionDir: string,
  session: TransferSession
): Promise<void> => {
  const filePath = getSessionFilePath(sessionDir, session.type);
  const tempPath = `${filePath}.${randomUUID()}.tmp`;

  try {
    await mkdir(sessionDir, { recursive: true });
    await writeFile(tempPath, JSON.stringify(session, null, 2), "utf-8");
    await rename(tempPath, filePath);
  } catch (err) {
    // Clean up temp file if rename failed
    await unlink(tempPath).catch(() => {});
    console.error("[SessionState] Failed to save session:", err);
    throw err;
  }
};

export const loadTransferSession = async (
  sessionDir: string,
  type: TransferType
): Promise<TransferSession | null> => {
  const filePath = getSessionFilePath(sessionDir, type);
  try {
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data) as TransferSession;
  } catch {
    return null;
  }
};

export const deleteTransferSession = async (
  sessionDir: string,
  type: TransferType
): Promise<void> => {
  const filePath = getSessionFilePath(sessionDir, type);
  try {
    await unlink(filePath);
  } catch {
    // Ignore if file doesn't exist
  }
};

export const readFileFromPath = async (
  filePath: string
): Promise<{ data: Uint8Array; filename: string }> => {
  const data = await readFile(filePath);
  const filename = path.basename(filePath);
  return { data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength), filename };
};
