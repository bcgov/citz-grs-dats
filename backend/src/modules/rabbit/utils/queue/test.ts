import type amqp from "amqplib";
import { getChannel } from "../connection";
import { ANSI_CODES } from "@bcgov/citz-imb-express-utilities";

const QUEUE_NAME = "TEST_QUEUE";

// Add a message to the queue
export const addToTestQueue = async (message: string): Promise<void> => {
	const channel = await getChannel(QUEUE_NAME);
	channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
};

const consumer = (msg: amqp.ConsumeMessage, channel: amqp.Channel) => {
	const jobID = msg.content.toString();
	console.log(`[${QUEUE_NAME}] Processed job: ${jobID}`);
	setTimeout(() => channel.ack(msg), 10 * 1000);
};

// Start consuming messages from a specific queue
const startQueueConsumer = async (): Promise<void> => {
	try {
		console.log(
			`${ANSI_CODES.FOREGROUND.AQUA}[${QUEUE_NAME}]${ANSI_CODES.FORMATTING.RESET} Starting queue consumer...`,
		);
		const channel = await getChannel(QUEUE_NAME);
		channel.prefetch(1); // Only process one message at a time
		channel.consume(
			QUEUE_NAME,
			(msg) => {
				if (msg) {
					consumer(msg, channel);
				}
			},
			{ noAck: false },
		);
		console.log(
			`${ANSI_CODES.FOREGROUND.AQUA}[${QUEUE_NAME}]${ANSI_CODES.FORMATTING.RESET} Consumer started.`,
		);
	} catch (error) {
		console.error(
			`${ANSI_CODES.FOREGROUND.AQUA}[${QUEUE_NAME}]${ANSI_CODES.FORMATTING.RESET} Failed to consume messages from RabbitMQ:`,
			error,
		);
	}
};

// Start the consumer immediately
startQueueConsumer();
