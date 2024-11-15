import type amqp from "amqplib";
import { getChannel, startQueueConsumer } from "../connection";

const QUEUE_NAME = "CREATE_FILE_LIST_QUEUE";

// Add a message to the queue
export const addToCreateFileListQueue = async (message: string): Promise<void> => {
	const channel = await getChannel(QUEUE_NAME);
	channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
};

export const createFileListConsumer = (msg: amqp.ConsumeMessage, channel: amqp.Channel) => {
	const jobID = msg.content.toString();
	console.log(`[${QUEUE_NAME}] Processed job: ${jobID}`);
};

// Start the consumer immediately
startQueueConsumer(QUEUE_NAME);
