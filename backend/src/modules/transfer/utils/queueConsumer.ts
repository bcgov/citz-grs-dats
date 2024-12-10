import { TRANSFER_QUEUE_NAME as QUEUE_NAME } from "@/modules/rabbit/utils/queue/transfer";
import type amqp from "amqplib";

export const queueConsumer = async (msg: amqp.ConsumeMessage, channel: amqp.Channel) => {
	const jobID = msg.content.toString();
	console.log(`[${QUEUE_NAME}] Processed job: ${jobID}`);

	return channel.ack(msg);
};
