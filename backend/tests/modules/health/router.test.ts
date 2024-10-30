import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/health/router";
import { services } from "@/modules/health/controllers";

// Mock the controller functions
jest.mock("@/modules/health/controllers", () => ({
	services: jest.fn((req: Request, res: Response) => res.status(200).send("Complete")),
}));

// Helper function to create an Express app with the router
const createApp = () => {
	const app = express();
	app.use(router);
	return app;
};

describe("Health Router", () => {
	// Test case for /services route
	it("should call the services controller on /services route", async () => {
		const app = createApp();
		await request(app).get("/services").expect(200, "Complete");
		expect(services).toHaveBeenCalled();
	});
});
