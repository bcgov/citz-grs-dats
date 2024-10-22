import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/rabbit/router";
import { addToRabbitQueue } from "@/modules/rabbit/controllers";

// Mock the controller functions
jest.mock("@/modules/rabbit/controllers", () => ({
	addToRabbitQueue: jest.fn((req: Request, res: Response) => res.status(200).send("Complete")),
}));

// Helper function to create an Express app with the router
const createApp = () => {
	const app = express();
	app.use(router);
	return app;
};

describe("Rabbit Router", () => {
	// Test case for /addToQueue route
	it("should call the addToRabbitQueue controller on /addToQueue route", async () => {
		const app = createApp();
		await request(app).post("/addToQueue").expect(200, "Complete");
		expect(addToRabbitQueue).toHaveBeenCalled();
	});
});
