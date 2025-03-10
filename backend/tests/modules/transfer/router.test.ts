import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/transfer/router";
import {
  create,
  lan,
  edrms,
  view,
  download,
  preserve,
  remove,
} from "@/modules/transfer/controllers";

// Mock the controller functions
jest.mock("@/modules/transfer/controllers", () => ({
  create: jest.fn((req: Request, res: Response) =>
    res.status(201).send("Complete")
  ),
  lan: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ success: true })
  ),
  edrms: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ success: true })
  ),
  view: jest.fn((req: Request, res: Response) =>
    res.status(200).send("Complete")
  ),
  download: jest.fn((req: Request, res: Response) =>
    res.status(200).send("Complete")
  ),
  preserve: jest.fn((req: Request, res: Response) =>
    res.status(200).send("Complete")
  ),
  remove: jest.fn((req: Request, res: Response) =>
    res.status(200).send("Complete")
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

  // Test case: GET / route
  it("should call the view controller on GET / route", async () => {
    const app = createApp();
    await request(app).get("/").expect(200, "Complete");
    expect(view).toHaveBeenCalled();
  });

  // Test case: DELETE / route
  it("should call the remove controller on DELETE / route", async () => {
    const app = createApp();
    await request(app).delete("/").expect(200, "Complete");
    expect(remove).toHaveBeenCalled();
  });

  // Test case: POST /download route
  it("should call the download controller on POST /download route", async () => {
    const app = createApp();
    await request(app).post("/download").expect(200, "Complete");
    expect(download).toHaveBeenCalled();
  });

  // Test case: POST /preserve route
  it("should call the preserve controller on POST /preserve route", async () => {
    const app = createApp();
    await request(app).post("/preserve").expect(200, "Complete");
    expect(preserve).toHaveBeenCalled();
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

  // Test case: POST /edrms route with valid JSON
  it("should call the edrms controller on POST /edrms with valid JSON", async () => {
    const app = createApp();
    const response = await request(app)
      .post("/edrms")
      .field("metadata", JSON.stringify({ version: 2 }));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(edrms).toHaveBeenCalled();
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
