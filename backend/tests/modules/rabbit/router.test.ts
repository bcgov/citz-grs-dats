import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/rabbit/router";
import { addToTestQueue } from "@/modules/rabbit/controllers";

// Mock the controller functions
jest.mock("@/modules/rabbit/controllers", () => ({
	addToTestQueue: jest.fn((req: Request, res: Response) => res.status(200).send("Complete")),
}));

// Helper function to create an Express app with the router
const createApp = () => {
	const app = express();
	app.use(router);
	return app;
};

describe("Rabbit Router", () => {
	// Test case for /addToTestQueue route
	it("should call the addToTestQueue controller on /addToTestQueue route", async () => {
		const app = createApp();
		await request(app).post("/addToTestQueue").expect(200, "Complete");
		expect(addToTestQueue).toHaveBeenCalled();
	});
});
