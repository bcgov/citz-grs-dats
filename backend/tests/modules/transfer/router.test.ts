import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/transfer/router";
import { create, lan } from "@/modules/transfer/controllers";
import multer from "multer";

// Mock the controller functions
jest.mock("@/modules/transfer/controllers", () => ({
  create: jest.fn((req: Request, res: Response) =>
    res.status(201).send("Complete")
  ),
  lan: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ success: true })
  ),
}));

// Helper function to create an Express app with the router
const createApp = () => {
  const app = express();
  app.use(express.json()); // Ensure JSON middleware is applied
  app.use(router);
  return app;
};

// Test suite for Transfer Router
describe("Transfer Router", () => {
  // Test case: POST / route
  it("should call the create controller on POST / route", async () => {
    const app = createApp();
    await request(app).post("/").expect(201, "Complete");
    expect(create).toHaveBeenCalled();
  });

  // Test case: POST /lan route with valid JSON
  it("should call the lan controller on POST /lan with valid JSON", async () => {
    const app = createApp();
    const response = await request(app)
      .post("/lan")
      .field("originalFoldersMetadata", JSON.stringify({ key: "value" }))
      .field("metadataV2", JSON.stringify({ version: 2 }))
      .field("changes", JSON.stringify(["change1", "change2"]));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(lan).toHaveBeenCalled();
  });

  // Test case: POST /lan route with invalid JSON
  it("should return 400 error for invalid JSON in POST /lan", async () => {
    const app = createApp();
    const response = await request(app)
      .post("/lan")
      .field("originalFoldersMetadata", "invalid-json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid JSON format in request body",
    });
  });
});
