import amqp from "amqplib";
import { ENV } from "src/config";
import { logs } from "src/utils";

const { RABBITMQ_URL } = ENV;

const {
  RABBITMQ: {
    CONNECTION_SUCCESS,
    CONNECTION_ERROR,
    CONNECTION_CLOSED,
    CHANNEL_CLOSED,
    CHANNEL_CREATED_QUEUE_ASSERTED,
    FAILED_TO_CLOSE_CONNECTION,
  },
} = logs;

let connection: amqp.Connection | null = null;
let isConnected = false;
const channelPromises: Map<string, Promise<amqp.Channel>> = new Map();

// Connect to RabbitMQ and create a channel for a specific queue
const connectToRabbitMQ = async (queue: string): Promise<void> => {
  try {
    if (!RABBITMQ_URL)
      throw new Error("RABBITMQ_URL env variable is undefined.");
    if (!connection) {
      connection = await amqp.connect(RABBITMQ_URL);
      isConnected = true;
      console.log(`${CONNECTION_SUCCESS} ${queue}`);
    }
    if (!channelPromises.has(queue)) {
      const channelPromise = connection.createChannel().then(async (chan) => {
        await chan.assertQueue(queue, { durable: false });
        console.log(CHANNEL_CREATED_QUEUE_ASSERTED(queue));
        return chan;
      });
      channelPromises.set(queue, channelPromise);
    }
  } catch (error) {
    console.error(CONNECTION_ERROR, error);
    throw error;
  }
};

// Get or create a channel for a specific queue
export const getChannel = async (queue: string): Promise<amqp.Channel> => {
  if (!channelPromises.has(queue)) {
    await connectToRabbitMQ(queue); // Establish connection and channel if not already done
  }
  // biome-ignore lint/style/noNonNullAssertion: Ensures the channel exists in the Map
  return channelPromises.get(queue)!;
};

// Close the connection to RabbitMQ and all channels
export const closeRabbitMQConnection = async (): Promise<void> => {
  try {
    for (const [queue, channelPromise] of channelPromises.entries()) {
      const channel = await channelPromise;
      if (channel) {
        await channel.close();
        console.log(CHANNEL_CLOSED(queue));
      }
    }
    channelPromises.clear();

    if (connection) {
      await connection.close();
      connection = null;
      isConnected = false;
      console.log(CONNECTION_CLOSED);
    }
  } catch (error) {
    console.error(FAILED_TO_CLOSE_CONNECTION, error);
    throw error;
  }
};

export const checkRabbitConnection = (): boolean => {
  return isConnected;
};
