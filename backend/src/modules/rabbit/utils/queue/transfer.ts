import { queueConsumer } from "src/modules/transfer/utils";
import { getChannel } from "../connection";
import { logs } from "src/utils";

const QUEUE_NAME = "STANDARD_TRANSFER_QUEUE";
export const TRANSFER_QUEUE_NAME = QUEUE_NAME;

const {
  RABBITMQ: { STARTING_CONSUMER, STARTED_CONSUMER, FAILED_TO_CONSUME_MESSAGES },
} = logs;

// Add a message to the queue
export const addToStandardTransferQueue = async (
  message: string
): Promise<void> => {
  const channel = await getChannel(QUEUE_NAME);
  channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
};

// Start consuming messages from a specific queue
const startQueueConsumer = async (): Promise<void> => {
  try {
    console.log(STARTING_CONSUMER(QUEUE_NAME));
    const channel = await getChannel(QUEUE_NAME);
    channel.prefetch(1); // Only process one message at a time
    channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (msg) {
          queueConsumer(msg, channel);
        }
      },
      { noAck: false }
    );
    console.log(STARTED_CONSUMER(QUEUE_NAME));
  } catch (error) {
    console.error(FAILED_TO_CONSUME_MESSAGES(QUEUE_NAME), error);
  }
};

// Start the consumer immediately
startQueueConsumer();
