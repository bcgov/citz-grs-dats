import type amqp from "amqplib";
import { getChannel, startQueueConsumer } from "../connection";

const QUEUE_NAME = "TEST_QUEUE";

// Add a message to the queue
export const addToTestQueue = async (message: string): Promise<void> => {
	const channel = await getChannel(QUEUE_NAME);
	channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
};

export const testConsumer = (msg: amqp.ConsumeMessage, channel: amqp.Channel) => {
	const jobID = msg.content.toString();
	console.log(`[${QUEUE_NAME}] Processed job: ${jobID}`);
	setTimeout(() => channel.ack(msg), 10 * 1000);
};

// Start the consumer immediately
startQueueConsumer(QUEUE_NAME);
