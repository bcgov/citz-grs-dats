import { getChannel } from "./connection";

const QUEUE_NAME = "test_queue";

// Add a message to the queue
export const addToTestQueue = async (message: string): Promise<void> => {
	const channel = await getChannel();
	channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
};

// Start consuming messages from the queue
export const startQueueConsumer = async (): Promise<void> => {
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
		throw error;
	}
};
