import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { useNotification } from "./useNotification";

// Mock Toast component and react-toastify
jest.mock("@renderer/components", () => ({
	Toast: jest.fn(() => <div>Toast</div>),
}));
jest.mock("react-toastify", () => {
	const actual = jest.requireActual("react-toastify");
	return {
		...actual,
		toast: {
			error: jest.fn(),
			success: jest.fn(),
		},
		ToastContainer: jest.fn(({ children }) => <div>{children}</div>),
	};
});
jest.mock("./getXlsxFileListNotificationData", () => ({
	getXlsxFileListNotificationData: jest.fn((message: string) => ({
		success: false,
		title: "Excel Error",
		message,
	})),
}));

describe("useNotification", () => {
	const TestComponent = () => {
		const { notify, NotificationContainer } = useNotification();
		return (
			<div>
				<button
					type="button"
					onClick={() =>
						notify.error({
							title: "Error",
							message: "Something went wrong",
							error: "Error details",
						})
					}
				>
					Error
				</button>
				<button
					type="button"
					onClick={() =>
						notify.success({
							title: "Success",
							message: "Operation successful",
						})
					}
				>
					Success
				</button>
				<button type="button" onClick={() => notify.excelError("Excel error occurred")}>
					Excel Error
				</button>
				<button type="button" onClick={() => notify.log("Log message", { foo: "bar" })}>
					Log
				</button>
				<NotificationContainer />
			</div>
		);
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should call toast.error with error notification", () => {
		render(<TestComponent />);
		act(() => {
			screen.getByText("Error").click();
		});
		expect(require("react-toastify").toast.error).toHaveBeenCalled();
	});

	it("should call toast.success with success notification", () => {
		render(<TestComponent />);
		act(() => {
			screen.getByText("Success").click();
		});
		expect(require("react-toastify").toast.success).toHaveBeenCalled();
	});

	it("should call toast.error with excel error notification", () => {
		render(<TestComponent />);
		act(() => {
			screen.getByText("Excel Error").click();
		});
		expect(require("react-toastify").toast.error).toHaveBeenCalled();
	});

	it("should log messages to the console", () => {
		const spy = jest.spyOn(console, "info").mockImplementation(() => {});
		render(<TestComponent />);
		act(() => {
			screen.getByText("Log").click();
		});
		expect(spy).toHaveBeenCalledWith("Log message", { foo: "bar" });
		spy.mockRestore();
	});

	it("should log error to the console when error is a string", () => {
		const spy = jest.spyOn(console, "error").mockImplementation(() => {});
		render(<TestComponent />);
		act(() => {
			// Simulate string error
			// @ts-ignore
			useNotification().notify.error("String error");
		});
		expect(spy).toHaveBeenCalledWith(expect.any(Error));
		spy.mockRestore();
	});
});
