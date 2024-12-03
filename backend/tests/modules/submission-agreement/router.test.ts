import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/submission-agreement/router";
import { create, get } from "@/modules/submission-agreement/controllers";

// Mock the controller functions
jest.mock("@/modules/submission-agreement/controllers", () => ({
	get: jest.fn((req: Request, res: Response) => res.status(200).send("Complete")),
	create: jest.fn((req: Request, res: Response) => res.status(201).send("Complete")),
}));

// Helper function to create an Express app with the router
const createApp = () => {
	const app = express();
	app.use(router);
	return app;
};

describe("Submission Agreement Router", () => {
	// Test case for GET / route
	it("should call the get controller on GET / route", async () => {
		const app = createApp();
		await request(app).get("/").expect(200, "Complete");
		expect(get).toHaveBeenCalled();
	});

	// Test case for POST / route
	it("should call the create controller on POST / route", async () => {
		const app = createApp();
		await request(app).post("/").expect(201, "Complete");
		expect(create).toHaveBeenCalled();
	});
});
