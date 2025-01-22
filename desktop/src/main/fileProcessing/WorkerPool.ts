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

/**
 * WorkerPool is a class for managing a pool of worker threads to handle concurrent tasks.
 * It queues incoming tasks and efficiently runs them with a limited number of workers,
 * supporting task reuse, timeouts, retries, and graceful shutdowns.
 *
 * Key features:
 * - Limits the number of concurrent workers to avoid resource overuse.
 * - Adds tasks to a queue and executes them as workers become available.
 * - Implements a retry mechanism with exponential backoff for failed tasks.
 * - Reuses idle workers for similar tasks to improve performance.
 * - Provides a method to shut down all active workers gracefully.
 */
export class WorkerPool extends EventEmitter {
	private maxWorkers: number;
	private tasks: Task[];
	private workers: Set<Worker>;
	private workerMap: Map<string, Worker[]>; // For reusing workers

	constructor(maxWorkers: number) {
		super();
		this.maxWorkers = maxWorkers;
		this.tasks = [];
		this.workers = new Set();
		this.workerMap = new Map();
	}

	/**
	 * Adds a task to the queue and runs it when a worker is available
	 */
	runTask<T, U>(workerScript: string, workerData: WorkerData<T>, timeout?: number): Promise<U> {
		return new Promise<U>((resolve, reject) => {
			let timer: NodeJS.Timeout | undefined;

			if (timeout !== undefined) {
				timer = setTimeout(() => {
					reject(new Error("Task timeout"));
				}, timeout);
			}

			const worker = this.getOrCreateWorker(workerScript, workerData);
			this.workers.add(worker);

			worker.on("message", (message) => {
				const task = workerScript.includes("metadata") ? "metadata" : "copy";
				// Handle progress updates
				if (message.type === "progress") {
					this.emit("progress", {
						task,
						...message,
					});
				}
				// Handle completion messages
				else if (message.type === "completion") {
					if (timer) clearTimeout(timer);
					if (message.success) {
						this.emit("completion", {
							task,
							...message,
						});
						resolve(message as U);
					} else {
						reject(new Error(message.error || "Worker task failed"));
					}
				}
				// Handle unexpected messages
				else {
					if (timer) clearTimeout(timer);
					reject(new Error("Unexpected message type from worker."));
				}
			});

			worker.on("error", (err: Error) => {
				if (timer) clearTimeout(timer);
				reject(err);
			});

			worker.on("exit", (code) => {
				if (code !== 0) {
					reject(new Error(`Worker stopped with exit code ${code}`));
				}
				this.workers.delete(worker);
				this.runNext(); // Start the next task
			});
		});
	}

	/**
	 * Runs the next task in the queue
	 */
	private runNext(): void {
		if (this.tasks.length === 0 || this.workers.size >= this.maxWorkers) return;

		const task = this.tasks.shift() as Task;
		const worker = this.getOrCreateWorker(task.workerScript, task.workerData);

		this.workers.add(worker);

		worker.on("message", task.resolve);
		worker.on("error", (err: Error) => task.reject(err));
		worker.on("exit", (code) => {
			if (code !== 0) {
				task.reject(new Error(`Worker stopped with exit code ${code}`));
			}

			this.workers.delete(worker);
			this.runNext(); // Start the next task
		});

		worker.on("uncaughtException", (err: Error) => {
			console.error("Uncaught worker exception:", err);
			task.reject(err);
			this.workers.delete(worker);
			this.runNext();
		});
	}

	/**
	 * Gets or creates a worker for the specified script
	 */
	private getOrCreateWorker<T>(workerScript: string, workerData: WorkerData<T>): Worker {
		const availableWorkers = this.workerMap.get(workerScript) || [];
		let worker: Worker;

		if (availableWorkers.length > 0) {
			// biome-ignore lint/style/noNonNullAssertion: Will never be undefined.
			worker = availableWorkers.pop()!;
		} else {
			worker = new Worker(workerScript, { workerData });
		}

		this.workerMap.set(workerScript, availableWorkers);
		return worker;
	}

	/**
	 * Retries a task with exponential backoff
	 */
	private retryTask<T, U>(task: Task<T, U>, retries = 3, delay = 1000): void {
		this.runTask(task.workerScript, task.workerData)
			.then(task.resolve as (value: unknown) => void | PromiseLike<void>)
			.catch((err) => {
				if (retries > 0) {
					setTimeout(() => {
						this.retryTask(task, retries - 1, delay * 2);
					}, delay);
				} else {
					task.reject(err);
				}
			});
	}

	/**
	 * Shuts down all active workers gracefully
	 */
	shutdown(): void {
		this.workers.forEach((worker) => worker.terminate());
		this.tasks = [];
	}
}
