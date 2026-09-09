import { promises as fsPromises } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { app } from "electron";
import type { WorkerMetricsSnapshot } from "../workers/utilities/metrics";

export const METRICS_CACHE_DIR = path.join(
  app.getPath("userData"),
  "dats-metrics-cache"
);

export type FolderMetricsOperationType = "metadata" | "copy";
export type FolderMetricsStatus =
  | "processing"
  | "completed"
  | "failed"
  | "timedOut";

export type DisconnectSegment = {
  startedAt: string;
  endedAt: string;
  durationMs: number;
};

export type FolderMetricsState = {
  version: number;
  sourcePath: string;
  originalSource: string;
  operationType: FolderMetricsOperationType;
  status: FolderMetricsStatus;
  startedAt: string;
  completedAt: string | null;
  totalElapsedTimeMs: number;
  totalProcessingTimeMs: number;
  totalDisconnectedTimeMs: number;
  disconnectCount: number;
  regularFileMetadataProcessingTimeMs: number;
  extendedFileMetadataProcessingTimeMs: number;
  workerRuns: number;
  disconnectSegments: DisconnectSegment[];
  formatted: {
    totalElapsedTime: string;
    totalProcessingTime: string;
    totalDisconnectedTime: string;
    regularFileMetadataProcessingTime: string;
    extendedFileMetadataProcessingTime: string;
  };
};

export const getMetricsFilePath = (
  sourcePath: string,
  operationType: FolderMetricsOperationType
): string => {
  const hash = crypto
    .createHash("sha256")
    .update(sourcePath)
    .digest("hex");
  return path.join(METRICS_CACHE_DIR, `${hash}-${operationType}.json`);
};

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
};

/**
 * Accumulates performance metrics for one folder-processing operation in the
 * main process. Worker threads report their own timings via `metrics` messages
 * which are folded in with accumulateWorkerMetrics; disconnect periods are
 * tracked here because they span worker restarts (worker pauses + recovery
 * polling).
 */
export class FolderMetricsTracker {
  private readonly operationStartedAt = Date.now();
  private readonly persistPath: string;
  private disconnectStartTime: number | null = null;
  private readonly state: FolderMetricsState;

  constructor(opts: {
    sourcePath: string;
    originalSource: string;
    operationType: FolderMetricsOperationType;
  }) {
    this.persistPath = getMetricsFilePath(opts.sourcePath, opts.operationType);
    this.state = {
      version: 1,
      sourcePath: opts.sourcePath,
      originalSource: opts.originalSource,
      operationType: opts.operationType,
      status: "processing",
      startedAt: new Date(this.operationStartedAt).toISOString(),
      completedAt: null,
      totalElapsedTimeMs: 0,
      totalProcessingTimeMs: 0,
      totalDisconnectedTimeMs: 0,
      disconnectCount: 0,
      regularFileMetadataProcessingTimeMs: 0,
      extendedFileMetadataProcessingTimeMs: 0,
      workerRuns: 0,
      disconnectSegments: [],
      formatted: {
        totalElapsedTime: "0s",
        totalProcessingTime: "0s",
        totalDisconnectedTime: "0s",
        regularFileMetadataProcessingTime: "0s",
        extendedFileMetadataProcessingTime: "0s",
      },
    };
  }

  get snapshot(): FolderMetricsState {
    return { ...this.state };
  }

  accumulateWorkerMetrics(metrics: WorkerMetricsSnapshot): void {
    this.state.workerRuns++;
    this.state.totalProcessingTimeMs += Math.max(
      0,
      metrics.activeProcessingTimeMs
    );
    this.state.regularFileMetadataProcessingTimeMs += Math.max(
      0,
      metrics.regularFileMetadataTimeMs
    );
    this.state.extendedFileMetadataProcessingTimeMs += Math.max(
      0,
      metrics.extendedFileMetadataTimeMs
    );
    this.state.formatted = this.buildFormatted();
  }

  recordDisconnectStart(startTimeMs: number): void {
    if (this.disconnectStartTime !== null) return;
    this.disconnectStartTime = startTimeMs;
  }

  recordDisconnectEnd(endTimeMs: number = Date.now()): void {
    if (this.disconnectStartTime === null) return;
    const durationMs = Math.max(0, endTimeMs - this.disconnectStartTime);
    this.state.totalDisconnectedTimeMs += durationMs;
    this.state.disconnectCount++;
    this.state.disconnectSegments.push({
      startedAt: new Date(this.disconnectStartTime).toISOString(),
      endedAt: new Date(endTimeMs).toISOString(),
      durationMs,
    });
    this.disconnectStartTime = null;
    this.state.formatted = this.buildFormatted();
  }

  finalize(status: Exclude<FolderMetricsStatus, "processing">): void {
    this.recordDisconnectEnd();
    this.state.status = status;
    this.state.completedAt = new Date().toISOString();
    this.state.totalElapsedTimeMs = Math.max(
      0,
      Date.now() - this.operationStartedAt
    );
    this.state.formatted = this.buildFormatted();
  }

  async persist(): Promise<void> {
    const dir = path.dirname(this.persistPath);
    const tempPath = `${this.persistPath}.tmp`;
    await fsPromises.mkdir(dir, { recursive: true });
    await fsPromises.writeFile(
      tempPath,
      JSON.stringify(this.state, null, 2),
      "utf-8"
    );
    await fsPromises.rename(tempPath, this.persistPath);
  }

  private buildFormatted() {
    return {
      totalElapsedTime: formatDuration(this.state.totalElapsedTimeMs),
      totalProcessingTime: formatDuration(this.state.totalProcessingTimeMs),
      totalDisconnectedTime: formatDuration(this.state.totalDisconnectedTimeMs),
      regularFileMetadataProcessingTime: formatDuration(
        this.state.regularFileMetadataProcessingTimeMs
      ),
      extendedFileMetadataProcessingTime: formatDuration(
        this.state.extendedFileMetadataProcessingTimeMs
      ),
    };
  }
}
