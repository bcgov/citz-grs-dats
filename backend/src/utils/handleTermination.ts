import { closeRabbitMQConnection } from "src/modules/rabbit/utils";

// Handle server shut down
export const handleTermination = async () => {
	try {
		await closeRabbitMQConnection();
		console.log("RabbitMQ connection closed.");
		process.exit(0); // Exit the process gracefully
	} catch (error) {
		console.error("Error closing RabbitMQ connection:", error);
		process.exit(1); // Exit with an error status
	}
};
