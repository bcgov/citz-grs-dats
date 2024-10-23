import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/s3/router";
import { health } from "@/modules/s3/controllers";

// Mock the controller functions
jest.mock("@/modules/s3/controllers", () => ({
	health: jest.fn((req: Request, res: Response) => res.status(200).send("Complete")),
}));

// Helper function to create an Express app with the router
const createApp = () => {
	const app = express();
	app.use(router);
	return app;
};

describe("S3 Router", () => {
	// Test case for /health route
	it("should call the health controller on /health route", async () => {
		const app = createApp();
		await request(app).post("/health").expect(200, "Complete");
		expect(health).toHaveBeenCalled();
	});
});
