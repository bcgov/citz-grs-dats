import type amqp from "amqplib";
import { getChannel } from "../connection";
import { logs } from "src/utils";

const QUEUE_NAME = "TEST_QUEUE";

const {
  RABBITMQ: {
    JOB_PROCESSED,
    STARTING_CONSUMER,
    STARTED_CONSUMER,
    FAILED_TO_CONSUME_MESSAGES,
  },
} = logs;

// Add a message to the queue
export const addToTestQueue = async (message: string): Promise<void> => {
  const channel = await getChannel(QUEUE_NAME);
  channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
};

const consumer = (msg: amqp.ConsumeMessage, channel: amqp.Channel) => {
  const jobID = msg.content.toString();
  console.log(JOB_PROCESSED(QUEUE_NAME, jobID));
  setTimeout(() => channel.ack(msg), 10 * 1000);
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
          consumer(msg, channel);
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
