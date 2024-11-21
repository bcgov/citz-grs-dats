import { queueConsumer } from "@/modules/filelist/utils";
import { getChannel } from "../connection";

const QUEUE_NAME = "CREATE_FILE_LIST_QUEUE";

// Add a message to the queue
export const addToCreateFileListQueue = async (message: string): Promise<void> => {
	const channel = await getChannel(QUEUE_NAME);
	channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
};

// Start consuming messages from a specific queue
const startQueueConsumer = async (): Promise<void> => {
	try {
		console.log(`[${QUEUE_NAME}] Starting queue consumer...`);
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
		console.log(`[${QUEUE_NAME}] Consumer started.`);
	} catch (error) {
		console.error(`[${QUEUE_NAME}] Failed to consume messages from RabbitMQ:`, error);
	}
};

// Start the consumer immediately
startQueueConsumer();
