import { queueConsumer } from "src/modules/transfer/utils";
import { getChannel } from "../connection";
import { ANSI_CODES } from "@bcgov/citz-imb-express-utilities";

const QUEUE_NAME = "STANDARD_TRANSFER_QUEUE";
export const TRANSFER_QUEUE_NAME = QUEUE_NAME;

// Add a message to the queue
export const addToStandardTransferQueue = async (message: string): Promise<void> => {
	const channel = await getChannel(QUEUE_NAME);
	channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
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
					queueConsumer(msg, channel);
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
