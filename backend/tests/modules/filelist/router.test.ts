import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/filelist/router";
import { create } from "@/modules/filelist/controllers";

// Mock the controller functions
jest.mock("@/modules/filelist/controllers", () => ({
	create: jest.fn((req: Request, res: Response) => res.status(201).send("Complete")),
}));

// Helper function to create an Express app with the router
const createApp = () => {
	const app = express();
	app.use(router);
	return app;
};

describe("Filelist Router", () => {
	// Test case for /create route
	it("should call the create controller on POST / route", async () => {
		const app = createApp();
		await request(app).post("/").expect(201, "Complete");
		expect(create).toHaveBeenCalled();
	});
});
