import type { Request, Response } from "express";
import { addToRabbitQueue } from "@/modules/rabbit/controllers/addToRabbitQueue";
import { addToQueue } from "@/modules/rabbit/queue";

// Mock addToQueue function
jest.mock("@/modules/rabbit/queue", () => ({
	addToQueue: jest.fn(),
}));

// Mock the response object
const mockResponse = () => {
	const res: Partial<Response> = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res as Response;
};

describe("addToRabbitQueue Controller", () => {
	beforeEach(() => {
		jest.clearAllMocks(); // Clear mocks before each test
	});

	// Test suite for addToRabbitQueue
	it("should add a job to the queue and return a success response", async () => {
		const req = {} as Request;
		const res = mockResponse();
		const next = jest.fn();

		// Mock addToQueue function to resolve successfully
		(addToQueue as jest.Mock).mockResolvedValueOnce(undefined);

		await addToRabbitQueue(req, res, next);

		// Test case: Should call addToQueue with the correct job ID
		expect(addToQueue).toHaveBeenCalledWith(expect.stringContaining("job-"));

		// Test case: Should respond with success and job ID
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: "Queue will process a job every 10 seconds.",
			jobID: expect.stringContaining("job-"),
		});
	});

	it("should handle errors and return a 500 response", async () => {
		const req = {} as Request;
		const res = mockResponse();
		const next = jest.fn();

		// Mock addToQueue function to throw an error
		(addToQueue as jest.Mock).mockRejectedValueOnce(new Error("Queue error"));

		await addToRabbitQueue(req, res, next);

		// Test case: Should respond with a 500 error
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			error: "Queue error",
		});
	});

	// Test case: should return 500 with "An unknown error occurred during addToRabbitQueue."
	it('should return 500 with "An unknown error occurred during addToRabbitQueue."', async () => {
		const req = {} as Request;
		const res = mockResponse();
		const next = jest.fn();

		// Mock addToQueue to throw a non-standard error (e.g., a string)
		(addToQueue as jest.Mock).mockImplementationOnce(() => {
			throw "Non-standard error";
		});

		await addToRabbitQueue(req, res, next);

		// Assert: Should respond with a 500 error and the generic message
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			error: "An unknown error occurred during addToRabbitQueue.",
		});
	});
});
