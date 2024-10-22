import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import router from "@/modules/auth/router";
import { login, loginCallback, logout, logoutCallback, token } from "@/modules/auth/controllers";

// Mock the controller functions
jest.mock("@/modules/auth/controllers", () => ({
	login: jest.fn((req: Request, res: Response) => res.status(200).send("Login")),
	loginCallback: jest.fn((req: Request, res: Response) => res.status(200).send("Login Callback")),
	logout: jest.fn((req: Request, res: Response) => res.status(200).send("Logout")),
	logoutCallback: jest.fn((req: Request, res: Response) => res.status(204).send("Logged out")),
	token: jest.fn((req: Request, res: Response) => res.status(200).send("Token")),
}));

// Helper function to create an Express app with the router
const createApp = () => {
	const app = express();
	app.use(router);
	return app;
};

describe("Auth Router", () => {
	// Test case for /login route
	it("should call the login controller on /login route", async () => {
		const app = createApp();
		await request(app).get("/login").expect(200, "Login");
		expect(login).toHaveBeenCalled();
	});

	// Test case for /login/callback route
	it("should call the loginCallback controller on /login/callback route", async () => {
		const app = createApp();
		await request(app).get("/login/callback").expect(200, "Login Callback");
		expect(loginCallback).toHaveBeenCalled();
	});

	// Test case for /logout route
	it("should call the logout controller on /logout route", async () => {
		const app = createApp();
		await request(app).get("/logout").expect(200, "Logout");
		expect(logout).toHaveBeenCalled();
	});

	// Test case for /logout/callback route
	it("should call the logoutCallback controller on /logout/callback route", async () => {
		const app = createApp();
		await request(app).get("/logout/callback").expect(204); // Expecting 204 for successful logout callback
		expect(logoutCallback).toHaveBeenCalled();
	});

	// Test case for /token route
	it("should call the token controller on /token route", async () => {
		const app = createApp();
		await request(app).get("/token").expect(200, "Token");
		expect(token).toHaveBeenCalled();
	});
});
