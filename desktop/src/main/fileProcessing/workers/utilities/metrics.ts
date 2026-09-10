/**
 * Active-time measurement utilities for worker processing.
 *
 * An ActiveTimer only counts time that is actually spent doing useful work.
 * It supports checkpoints: after each successful unit of work the elapsed time
 * is banked, so that if the worker later stalls on a disconnected source the
 * time between the last successful checkpoint and the detected error is NOT
 * counted as processing time (it is attributed to the disconnect instead).
 */
export class ActiveTimer {
  private accumulatedMs = 0;
  private activeStart: number | null = null;

  start(): void {
    if (this.activeStart === null) this.activeStart = Date.now();
  }

  checkpoint(): void {
    if (this.activeStart === null) return;
    this.accumulatedMs += Date.now() - this.activeStart;
    this.activeStart = Date.now();
  }

  stop(): void {
    if (this.activeStart === null) return;
    this.accumulatedMs += Date.now() - this.activeStart;
    this.activeStart = null;
  }

  pause(): void {
    this.activeStart = null;
  }

  get totalMs(): number {
    if (this.activeStart === null) return this.accumulatedMs;
    return this.accumulatedMs + (Date.now() - this.activeStart);
  }
}

export type WorkerMetricsSnapshot = {
  activeProcessingTimeMs: number;
  regularFileMetadataTimeMs: number;
  extendedFileMetadataTimeMs: number;
  lastSuccessfulWorkTime: number;
  disconnectDetected: boolean;
};

/**
 * Tracks per-worker-run performance metrics for a single worker thread.
 *
 * The "active processing time" spans the whole worker run (scanning, state
 * loading, regular/extended stages, saving state), while the regular and
 * extended stage timers attribute time to those specific stages. A disconnect
 * is considered to begin at the last successful checkpoint rather than when the
 * error is eventually detected, so active time freezes at that checkpoint.
 */
export class WorkerMetricsTracker {
  private readonly workerStartedAt = Date.now();
  private lastSuccess = Date.now();
  private paused = false;
  private readonly regularTimer = new ActiveTimer();
  private readonly extendedTimer = new ActiveTimer();

  checkpoint(): void {
    this.lastSuccess = Date.now();
  }

  startRegularStage(): void {
    this.regularTimer.start();
  }

  checkpointRegular(): void {
    this.regularTimer.checkpoint();
    this.checkpoint();
  }

  stopRegularStage(): void {
    this.regularTimer.stop();
  }

  startExtendedStage(): void {
    this.extendedTimer.start();
  }

  checkpointExtended(): void {
    this.extendedTimer.checkpoint();
    this.checkpoint();
  }

  stopExtendedStage(): void {
    this.extendedTimer.stop();
  }

  pause(): void {
    this.paused = true;
    this.regularTimer.pause();
    this.extendedTimer.pause();
  }

  snapshot(): WorkerMetricsSnapshot {
    const activeProcessingTimeMs = this.paused
      ? Math.max(0, this.lastSuccess - this.workerStartedAt)
      : Math.max(0, Date.now() - this.workerStartedAt);
    return {
      activeProcessingTimeMs,
      regularFileMetadataTimeMs: this.regularTimer.totalMs,
      extendedFileMetadataTimeMs: this.extendedTimer.totalMs,
      lastSuccessfulWorkTime: this.lastSuccess,
      disconnectDetected: this.paused,
    };
  }
}
