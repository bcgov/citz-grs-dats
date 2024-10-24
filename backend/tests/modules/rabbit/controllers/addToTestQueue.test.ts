import type { Request, Response } from "express";
import { addToTestQueue } from "@/modules/rabbit/controllers/addToTestQueue";
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

describe("addToTestQueue Controller", () => {
	beforeEach(() => {
		jest.clearAllMocks(); // Clear mocks before each test
	});

	it("should add a job to the queue and return a success response", async () => {
		const req = {} as Request;
		const res = mockResponse();
		const next = jest.fn();

		// Mock addToQueue function to resolve successfully
		(addToQueue as jest.Mock).mockResolvedValueOnce(undefined);

		await addToTestQueue(req, res, next);

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
});
