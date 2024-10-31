import amqp from "amqplib";
import { ENV } from "src/config";
import { logs } from "src/utils";

const { RABBITMQ_URL } = ENV;
const { RABBITMQ_CONNECTION_SUCCESS, RABBITMQ_CONNECTION_ERROR } = logs;
const QUEUE_NAME = "test_queue";

let channelPromise: Promise<amqp.Channel> | null = null;
let connection: amqp.Connection | null = null;
let isConnected = false;

// Connect to RabbitMQ and create a channel
const connectToRabbitMQ = async (): Promise<void> => {
	try {
		if (!RABBITMQ_URL) throw new Error("RABBITMQ_URL env variable is undefined.");
		if (!connection) {
			connection = await amqp.connect(RABBITMQ_URL);
			isConnected = true;
			console.log(RABBITMQ_CONNECTION_SUCCESS);
		}
		if (!channelPromise) {
			channelPromise = connection.createChannel().then(async (chan) => {
				await chan.assertQueue(QUEUE_NAME, { durable: false });
				console.log("Channel created and queue asserted.");
				return chan;
			});
		}
	} catch (error) {
		console.error(RABBITMQ_CONNECTION_ERROR, error);
		throw error;
	}
};

// Get or create a channel (ensures the channel is already initialized)
export const getChannel = async (): Promise<amqp.Channel> => {
	if (!channelPromise) {
		await connectToRabbitMQ(); // Establish connection and channel if not already done
	}
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	return channelPromise!;
};

// Close the connection to RabbitMQ
export const closeRabbitMQConnection = async (): Promise<void> => {
	try {
		if (channelPromise) {
			const channel = await channelPromise;
			if (channel) {
				await channel.close();
				console.log("RabbitMQ channel closed.");
			}
			channelPromise = null;
		}
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

// Add a message to the queue
export const addToTestQueue = async (message: string): Promise<void> => {
	const channel = await getChannel();
	channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
};

// Start consuming messages from the queue
export const startQueueConsumer = async (): Promise<void> => {
	try {
		console.log("Starting queue consumer...");
		const channel = await getChannel();
		channel.prefetch(1); // Only process one message at a time
		channel.consume(
			QUEUE_NAME,
			(msg) => {
				if (msg) {
					const jobID = msg.content.toString();
					console.log(`Processed job: ${jobID}`);
					setTimeout(() => channel.ack(msg), 10 * 1000);
				}
			},
			{ noAck: false },
		);
		console.log("Consumer started.");
	} catch (error) {
		console.error("Failed to consume messages from RabbitMQ:", error);
	}
};

// Start the consumer immediately
startQueueConsumer();
