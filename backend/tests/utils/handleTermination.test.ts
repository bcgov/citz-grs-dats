import { handleTermination } from "@/utils";
import { closeRabbitMQConnection } from "@/modules/rabbit/utils";

jest.mock("@/modules/rabbit/utils", () => ({
	closeRabbitMQConnection: jest.fn(),
}));

describe("handleTermination", () => {
	let exitSpy: jest.SpyInstance;

	beforeAll(() => {
		// Mock process.exit
		exitSpy = jest.spyOn(process, "exit").mockImplementation((code?: unknown) => {
			return code as never; // Mock implementation to avoid actual process exit
		});
	});

	afterAll(() => {
		// Restore process.exit to its original state
		exitSpy.mockRestore();
	});

	afterEach(() => {
		// Clear mocks after each test
		jest.clearAllMocks();
	});

	// Test case: Successfully closes RabbitMQ connection
	it("should close RabbitMQ connection and exit with code 0 on success", async () => {
		// Mock successful closeRabbitMQConnection
		(closeRabbitMQConnection as jest.Mock).mockResolvedValueOnce(undefined);

		// Call the handleTermination function
		await handleTermination();

		// Assert that closeRabbitMQConnection was called
		expect(closeRabbitMQConnection).toHaveBeenCalledTimes(1);

		// Assert that process.exit was called with code 0
		expect(exitSpy).toHaveBeenCalledWith(0);
	});

	// Test case: Fails to close RabbitMQ connection
	it("should log error and exit with code 1 if closing RabbitMQ connection fails", async () => {
		// Mock failing closeRabbitMQConnection
		const error = new Error("Failed to close connection");
		(closeRabbitMQConnection as jest.Mock).mockRejectedValueOnce(error);

		// Mock console.error
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

		// Call the handleTermination function
		await handleTermination();

		// Assert that closeRabbitMQConnection was called
		expect(closeRabbitMQConnection).toHaveBeenCalledTimes(1);

		// Assert that console.error was called with the error
		expect(consoleErrorSpy).toHaveBeenCalledWith("Error closing RabbitMQ connection:", error);

		// Assert that process.exit was called with code 1
		expect(exitSpy).toHaveBeenCalledWith(1);

		// Restore console.error
		consoleErrorSpy.mockRestore();
	});
});
