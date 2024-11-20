import type { Request, Response, NextFunction } from "express";
import { emailTest } from "@/modules/ches/controllers";
import { sendEmail } from "@/modules/ches/utils";
import { EmailDataSchema } from "@/modules/ches/schemas";
import type { StandardResponse, StandardResponseInput } from "@bcgov/citz-imb-express-utilities";

jest.mock("@/modules/ches/utils", () => ({
	sendEmail: jest.fn(),
}));

jest.mock("@bcgov/citz-imb-express-utilities", () => {
	const originalModule = jest.requireActual("@bcgov/citz-imb-express-utilities");
	return {
		...originalModule,
		errorWrapper: (fn: unknown) => fn,
	};
});

// Test suite for emailTest controller
describe("emailTest controller", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		req = {
			getStandardResponse: <TData>(
				dataInput: StandardResponseInput<TData>,
			): StandardResponse<TData> => {
				const { success = true, data, message } = dataInput;
				return {
					success,
					data,
					message: message ?? "",
				} as StandardResponse<TData>;
			},
			getZodValidatedBody: jest.fn(),
		};
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		res = {
			status: statusMock,
		} as Partial<Response>;
		next = jest.fn();

		jest.clearAllMocks(); // Clear previous mocks before each test
	});

	// Test case: Should return 201 if email is sent successfully
	it("should return 201 if email is sent successfully", async () => {
		(req.getZodValidatedBody as jest.Mock).mockReturnValue({ to: "test@example.com" });
		(sendEmail as jest.Mock).mockResolvedValue({ data: {}, success: true });

		await emailTest(req as Request, res as Response, next);

		expect(req.getZodValidatedBody).toHaveBeenCalledWith(EmailDataSchema);
		expect(sendEmail).toHaveBeenCalledWith({ to: "test@example.com" });
		expect(statusMock).toHaveBeenCalledWith(201);
		expect(jsonMock).toHaveBeenCalledWith({
			success: true,
			data: {},
			message: "CHES email successful.",
		});
	});

	// Test case: Should return 500 if email sending fails
	it("should return 500 if email sending fails", async () => {
		(req.getZodValidatedBody as jest.Mock).mockReturnValue({ to: "test@example.com" });
		(sendEmail as jest.Mock).mockResolvedValue({ data: {}, success: false });

		await emailTest(req as Request, res as Response, next);

		expect(req.getZodValidatedBody).toHaveBeenCalledWith(EmailDataSchema);
		expect(sendEmail).toHaveBeenCalledWith({ to: "test@example.com" });
		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			success: false,
			data: {},
			message: "CHES email failed.",
		});
	});

	// Test case: Should throw an error if sendEmail fails
	it("should throw an error if sendEmail fails", async () => {
		const sendEmailError = new Error("Email sending failed");
		(req.getZodValidatedBody as jest.Mock).mockReturnValue({ to: "test@example.com" });
		(sendEmail as jest.Mock).mockRejectedValue(sendEmailError);

		await expect(emailTest(req as Request, res as Response, next)).rejects.toThrow(
			"Email sending failed",
		);

		expect(req.getZodValidatedBody).toHaveBeenCalledWith(EmailDataSchema);
		expect(sendEmail).toHaveBeenCalledWith({ to: "test@example.com" });
	});
});
