import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/ches/router";
import { health } from "@/modules/ches/controllers";

// Mock the controller functions
jest.mock("@/modules/ches/controllers", () => ({
	health: jest.fn((req: Request, res: Response) => res.status(200).send("Complete")),
}));

// Helper function to create an Express app with the router
const createApp = () => {
	const app = express();
	app.use(router);
	return app;
};

describe("CHES Router", () => {
	// Test case for /health route
	it("should call the health controller on /health route", async () => {
		const app = createApp();
		await request(app).get("/health").expect(200, "Complete");
		expect(health).toHaveBeenCalled();
	});
});
