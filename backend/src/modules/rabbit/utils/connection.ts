import amqp from "amqplib";
import { ENV } from "src/config";
import { logs } from "src/utils";
import { createFileListConsumer, testConsumer } from "./queue";

const { RABBITMQ_URL } = ENV;
const { RABBITMQ_CONNECTION_SUCCESS, RABBITMQ_CONNECTION_ERROR } = logs;

const consumers: Record<string, (msg: amqp.ConsumeMessage, channel: amqp.Channel) => void> = {
	TEST_QUEUE: testConsumer,
	CREATE_FILE_LIST_QUEUE: createFileListConsumer,
};

let connection: amqp.Connection | null = null;
let isConnected = false;
const channelPromises: Map<string, Promise<amqp.Channel>> = new Map();

// Connect to RabbitMQ and create a channel for a specific queue
const connectToRabbitMQ = async (queue: string): Promise<void> => {
	try {
		if (!RABBITMQ_URL) throw new Error("RABBITMQ_URL env variable is undefined.");
		if (!connection) {
			connection = await amqp.connect(RABBITMQ_URL);
			isConnected = true;
			console.log(RABBITMQ_CONNECTION_SUCCESS);
		}
		if (!channelPromises.has(queue)) {
			const channelPromise = connection.createChannel().then(async (chan) => {
				await chan.assertQueue(queue, { durable: false });
				console.log(`[${queue}] Channel created and queue asserted.`);
				return chan;
			});
			channelPromises.set(queue, channelPromise);
		}
	} catch (error) {
		console.error(RABBITMQ_CONNECTION_ERROR, error);
		throw error;
	}
};

// Get or create a channel for a specific queue
export const getChannel = async (queue: string): Promise<amqp.Channel> => {
	if (!channelPromises.has(queue)) {
		await connectToRabbitMQ(queue); // Establish connection and channel if not already done
	}
	// biome-ignore lint/style/noNonNullAssertion: Ensures the channel exists in the Map
	return channelPromises.get(queue)!;
};

// Close the connection to RabbitMQ and all channels
export const closeRabbitMQConnection = async (): Promise<void> => {
	try {
		for (const [queue, channelPromise] of channelPromises.entries()) {
			const channel = await channelPromise;
			if (channel) {
				await channel.close();
				console.log(`[${queue}] RabbitMQ channel closed.`);
			}
		}
		channelPromises.clear();

		if (connection) {
			await connection.close();
			connection = null;
			isConnected = false;
			console.log("RabbitMQ connection closed.");
		}
	} catch (error) {
		console.error("Failed to close RabbitMQ connection:", error);
		throw error;
	}
};

export const checkRabbitConnection = (): boolean => {
	return isConnected;
};

// Start consuming messages from a specific queue
export const startQueueConsumer = async (queue: string): Promise<void> => {
	try {
		console.log(`[${queue}] Starting queue consumer...`);
		const channel = await getChannel(queue);
		channel.prefetch(1); // Only process one message at a time
		channel.consume(
			queue,
			(msg) => {
				if (msg) {
					consumers[queue](msg, channel);
				}
			},
			{ noAck: false },
		);
		console.log(`[${queue}] Consumer started.`);
	} catch (error) {
		console.error(`[${queue}] Failed to consume messages from RabbitMQ:`, error);
	}
};
