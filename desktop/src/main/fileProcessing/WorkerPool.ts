import { Worker } from "node:worker_threads";
import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto"; // Generates unique IDs

type WorkerData<T = unknown> = {
  [key: string]: T;
};

type Task<T = unknown, U = unknown> = {
  workerId: string;
  workerScript: string;
  workerData: WorkerData<T>;
  resolve: (value: U) => void;
  reject: (reason?: Error) => void;
};

export class WorkerPool extends EventEmitter {
  private maxWorkers: number;
  private tasks: Task[];
  private workers: Map<string, Worker>; // Store workers by ID

  constructor(maxWorkers: number) {
    super();
    this.maxWorkers = maxWorkers;
    this.tasks = [];
    this.workers = new Map();

    console.log(`Initializing WorkerPool with up to ${maxWorkers} workers.`);
  }

  /**
   * Runs a task and returns its worker ID immediately.
   */
  runTask<T, U>(
    workerScript: string,
    workerData: WorkerData<T>,
    timeout?: number
  ): { workerId: string; promise: Promise<U> } {
    const workerId = randomUUID(); // Generate unique worker ID

    const promise = new Promise<U>((resolve, reject) => {
      let timer: NodeJS.Timeout | undefined;
      if (timeout !== undefined) {
        timer = setTimeout(() => {
          reject(new Error(`Task timeout for worker ${workerId}`));
        }, timeout);
      }

      const worker = new Worker(workerScript, { workerData });
      this.workers.set(workerId, worker);

      console.log(`Worker started: ${workerId} (${workerScript})`);
      this.emit("taskStarted", { workerId, workerScript, workerData });

      worker.on("message", (message) => {
        if (message.type === "completion") {
          if (timer) clearTimeout(timer);

          if (message.success) {
            this.emit("completion", { workerId, ...message });
            console.log(`Task completed: ${workerId}`);
            resolve(message as U);
          } else {
            reject(new Error(message.error || "Worker task failed"));
          }
        } else {
          this.emit(message.type, { workerId, ...message });
        }
      });

      worker.on("error", (err) => {
        if (timer) clearTimeout(timer);
        console.error(`Worker error: ${err.message}`);
        this.emit("taskFailed", { workerId, error: err.message });
        reject(err);
      });

      worker.on("exit", (code) => {
        this.workers.delete(workerId);
        if (code !== 0) {
          console.error(`Worker ${workerId} exited with code ${code}.`);
        }
        this.runNext();
      });
    });

    return { workerId, promise }; // Return workerId immediately
  }

  /**
   * Cancels a specific worker by its worker ID.
   */
  shutdownWorkerById(workerId: string): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) {
      console.warn(`No active worker found with ID: ${workerId}`);
      return false;
    }

    console.log(`Shutting down worker: ${workerId}`);
    worker.terminate();
    this.workers.delete(workerId);
    return true;
  }

  /**
   * Runs the next task in the queue
   */
  private runNext(): void {
    if (this.tasks.length === 0) {
      console.log("No pending tasks.");
      return;
    }

    if (this.workers.size >= this.maxWorkers) {
      console.log("Max workers reached. Waiting for a free worker...");
      return;
    }

    const task = this.tasks.shift();
    if (!task) return;

    console.log(`Starting queued task: ${task.workerScript}`);
    this.runTask(task.workerScript, task.workerData)
      .promise.then(task.resolve)
      .catch(task.reject);
  }

  /**
   * Gracefully shuts down all workers.
   */
  shutdown(): void {
    console.log("Shutting down all workers...");
    this.workers.forEach((worker) => worker.terminate());
    this.tasks = [];
    this.workers.clear();
    console.log("Worker pool shutdown complete.");
  }
}
