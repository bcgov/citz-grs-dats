import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/submission-agreement/router";
import { create } from "@/modules/submission-agreement/controllers";

// Mock the controller functions
jest.mock("@/modules/submission-agreement/controllers", () => ({
	create: jest.fn((req: Request, res: Response) => res.status(201).send("Complete")),
}));

// Helper function to create an Express app with the router
const createApp = () => {
	const app = express();
	app.use(router);
	return app;
};

describe("Submission Agreement Router", () => {
	// Test case for / route
	it("should call the create controller on / route", async () => {
		const app = createApp();
		await request(app).post("/").expect(201, "Complete");
		expect(create).toHaveBeenCalled();
	});
});
