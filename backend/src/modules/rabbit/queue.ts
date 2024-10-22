import amqp from "amqplib";
import { ENV } from "src/config";

const { RABBITMQ_URL } = ENV;
const QUEUE_NAME = "test_queue";

// Connect to RabbitMQ and create a channel
const connectToRabbitMQ = async () => {
	try {
		if (!RABBITMQ_URL) throw new Error("RABBITMQ_URL env variable is undefined.");
		const connection = await amqp.connect(RABBITMQ_URL);
		const channel = await connection.createChannel();
		await channel.assertQueue(QUEUE_NAME, { durable: false });
		return channel;
	} catch (error) {
		console.error("Failed to connect to RabbitMQ:", error);
		throw error;
	}
};

// Create a channel instance for reuse
let channelPromise: Promise<amqp.Channel>;

// Get or create a channel
export const getChannel = async () => {
	if (!channelPromise) channelPromise = connectToRabbitMQ();
	return channelPromise;
};

// Add a message to the queue
export const addToQueue = async (message: string) => {
	const channel = await getChannel();
	channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
};

// Start consuming messages from the queue
export const startQueueConsumer = async () => {
	try {
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
	} catch (error) {
		console.error("Failed to consume messages from RabbitMQ:", error);
	}
};

// Start the consumer immediately
startQueueConsumer();
