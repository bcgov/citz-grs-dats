import { parentPort } from "node:worker_threads";

export type HashAlgorithm = "sha256" | "sha1" | "md5";

export type ChecksumMode = "full" | "fingerprint";

export type ProcessingConfig = {
  highWaterMark: number;
  concurrency: number;
  hashAlgorithms: HashAlgorithm[];
  checksumMode: ChecksumMode;
  fingerprintSize: number;
};

export const DEFAULT_PROCESSING_CONFIG: ProcessingConfig = {
  highWaterMark: 524288,
  concurrency: 5,
  hashAlgorithms: ["md5", "sha256"],
  checksumMode: "full",
  fingerprintSize: 64 * 1024,
};

type ProgressStep = {
  weight: number;
  label?: string;
};

export class ProgressReporter {
  private steps: ProgressStep[];
  private currentStep = 0;
  private stepProgress = 0;
  private totalItems = 0;
  private completedItems = 0;
  private currentFileName: string | undefined;
  private readonly source: string;

  constructor(source: string, steps: ProgressStep[]) {
    this.source = source;
    this.steps = steps;
    this.totalItems = 0;
  }

  setTotal(total: number): void {
    this.totalItems = total;
  }

  setCompleted(count: number): void {
    this.completedItems = count;
    if (this.totalItems > 0) {
      this.stepProgress = this.completedItems / this.totalItems;
    }
  }

  sendCurrentProgress(): void {
    this.send();
  }

  fileProcessed(fileName?: string): void {
    this.completedItems++;
    if (this.totalItems > 0) {
      this.stepProgress = this.completedItems / this.totalItems;
    }
    this.currentFileName = fileName;
    this.send();
  }

  phaseStarted(stepIndex: number, label?: string): void {
    this.currentStep = stepIndex;
    this.stepProgress = 0;
    if (label && this.steps[stepIndex]) {
      this.steps[stepIndex].label = label;
    }
    this.send();
  }

  phaseProgress(stepIndex: number, current: number, total: number): void {
    this.currentStep = stepIndex;
    this.stepProgress = total > 0 ? current / total : 0;
    this.send();
  }

  getPercentage(): number {
    let completedWeight = 0;
    let totalWeight = 0;

    for (let i = 0; i < this.steps.length; i++) {
      totalWeight += this.steps[i].weight;
      if (i < this.currentStep) {
        completedWeight += this.steps[i].weight;
      } else if (i === this.currentStep) {
        if (this.steps.length === 1) {
          completedWeight += this.totalItems > 0
            ? (this.completedItems / this.totalItems) * this.steps[i].weight
            : 0;
        } else {
          completedWeight += this.stepProgress * this.steps[i].weight;
        }
      }
    }

    if (totalWeight === 0) return 0;
    return Math.round((completedWeight / totalWeight) * 100);
  }

  getMessage(): string {
    const step = this.steps[this.currentStep];
    if (step?.label) return step.label;
    if (this.currentStep === 0 && this.totalItems > 0) {
      return `${this.completedItems}/${this.totalItems}`;
    }
    return "";
  }

  private send(): void {
    parentPort?.postMessage({
      type: "progress",
      source: this.source,
      progressPercentage: this.getPercentage(),
      currentFileIndex: this.completedItems,
      totalFiles: this.totalItems,
      fileProcessed: this.currentFileName ?? this.getMessage(),
    });
  }
}
