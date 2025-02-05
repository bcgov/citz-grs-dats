import { Worker } from "node:worker_threads";
import { EventEmitter } from "node:events";

type WorkerData<T = unknown> = {
  [key: string]: T;
};

type Task<T = unknown, U = unknown> = {
  workerScript: string;
  workerData: WorkerData<T>;
  resolve: (value: U) => void;
  reject: (reason?: Error) => void;
};

export class WorkerPool extends EventEmitter {
  private maxWorkers: number;
  private tasks: Task[];
  private workers: Set<Worker>;

  constructor(maxWorkers: number) {
    super();
    this.maxWorkers = maxWorkers;
    this.tasks = [];
    this.workers = new Set();

    console.log(`Initializing WorkerPool with up to ${maxWorkers} workers.`);
  }

  /**
   * Queues a task, emits an event, and runs it when a worker is available.
   */
  runTask<T, U>(
    workerScript: string,
    workerData: WorkerData<T>,
    timeout?: number
  ): Promise<U> {
    console.log(`Task queued: ${workerScript}`);
    this.emit("taskQueued", { workerScript, workerData });

    return new Promise<U>((resolve, reject) => {
      let timer: NodeJS.Timeout | undefined;

      if (timeout !== undefined) {
        timer = setTimeout(() => {
          reject(new Error("Task timeout"));
        }, timeout);
      }

      const worker = new Worker(workerScript, { workerData });
      this.workers.add(worker);

      console.log(`Starting worker for script: ${workerScript}`);
      this.emit("taskStarted", { workerScript, workerData });

      worker.on("message", (message) => {
        const taskType = workerScript.includes("metadata")
          ? "metadata"
          : "copy";

        if (message.type === "completion") {
          if (timer) clearTimeout(timer);

          if (message.success) {
            this.emit("completion", { task: taskType, ...message });
            console.log(`Task completed successfully: ${workerScript}`);
            resolve(message as U);
          } else {
            reject(new Error(message.error || "Worker task failed"));
          }
        } else {
          this.emit(message.type, { task: taskType, ...message });
        }
      });

      worker.on("error", (err) => {
        if (timer) clearTimeout(timer);
        console.error(`Worker error: ${err.message}`);
        this.emit("taskFailed", { workerScript, error: err.message });
        reject(err);
      });

      worker.on("exit", (code) => {
        this.workers.delete(worker);
        if (code !== 0) {
          console.error(`Worker exited with code ${code}.`);
        }
        this.runNext();
      });
    });
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

    console.log(`Starting task from queue: ${task.workerScript}`);
    this.runTask(task.workerScript, task.workerData)
      .then(task.resolve)
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
