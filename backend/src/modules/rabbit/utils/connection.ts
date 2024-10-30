import amqp from "amqplib";
import { ENV } from "src/config";

const { RABBITMQ_URL } = ENV;
const QUEUE_NAME = "test_queue";

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;
let isConnected = false;

// Connect to RabbitMQ and create a channel
export const connectToRabbitMQ = async (): Promise<amqp.Channel> => {
	try {
		if (!RABBITMQ_URL) throw new Error("RABBITMQ_URL env variable is undefined.");
		connection = await amqp.connect(RABBITMQ_URL);
		channel = await connection.createChannel();
		await channel.assertQueue(QUEUE_NAME, { durable: false });
		isConnected = true; // Update connection state
		return channel;
	} catch (error) {
		isConnected = false; // Update connection state on error
		console.error("Failed to connect to RabbitMQ:", error);
		throw error;
	}
};

// Get or create a channel
export const getChannel = async (): Promise<amqp.Channel> => {
	if (!channel || !connection) {
		channel = await connectToRabbitMQ();
	}
	return channel;
};

// Close the connection to RabbitMQ
export const closeRabbitMQConnection = async (): Promise<void> => {
	try {
		if (channel) {
			await channel.close();
			channel = null;
			console.log("RabbitMQ channel closed.");
		}
		if (connection) {
			await connection.close();
			connection = null;
			isConnected = false; // Update connection state
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
