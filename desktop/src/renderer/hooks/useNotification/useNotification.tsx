import { Toast } from "@renderer/components";
import { toast, ToastContainer, type ToastContainerProps } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { getXlsxFileListNotificationData } from "./getXlsxFileListNotificationData";

/**
 * Props for notification messages.
 */
export interface NotifyProps {
	title: string;
	message: string;
	error?: string;
}

/**
 * Default configuration for the ToastContainer.
 */
const toastConfig: ToastContainerProps = {
	position: "bottom-left",
	autoClose: 5000, // 5 seconds
	hideProgressBar: true,
	pauseOnHover: true,
	stacked: true,
};

const consoleStylesInfo = "color: #4caf50; font-weight: bold;";
const consoleStylesError = "color: #f44336; font-weight: bold;";
/**
 * Custom hook for showing notifications and logging.
 * Provides error, excelError, log, and success notification methods,
 * and a NotificationContainer component for rendering toasts.
 *
 * @returns {{ notify: object, NotificationContainer: React.FC }}
 *   notify: notification methods (error, excelError, log, success)
 *   NotificationContainer: component to render toast notifications
 */
export const useNotification = () => {
	const toastError = (data: NotifyProps) => {
		toast.error(Toast, {
			data:{success: false, ...data},
			autoClose: 10000, // 10 seconds
		});
	};

	const notify = {
		/**
		 * Show an error notification or log an error.
		 * @param {NotifyProps | string} props - Notification props or error message.
		 */
		error: (props: NotifyProps | string) => {
			if (typeof props === "string") {
				console.info(`%c ${props}`, consoleStylesError);
			} else {
				toastError(props);
				console.info(`%c ${props.error} %o`, consoleStylesError, props);
			}
		},
		/**
		 * Show an Excel-specific error notification.
		 * @param {string} message - Error message.
		 */
		excelError: (message: string) => {
			const notificationProps = getXlsxFileListNotificationData(message);
			toastError(notificationProps);
		},
		/**
		 * Log a message to the console.
		 * @param {string} message - Log message.
		 * @param {Record<string, unknown>} [args] - Optional additional arguments.
		 */
		log: (message: string, args?: Record<string, unknown>) => {
			console.info(`%c ${message}`, consoleStylesInfo);
			if (args) console.info({ ...args });
		},
		/**
		 * Show a success notification.
		 * @param {NotifyProps} props - Notification props.
		 */
		success: (props: NotifyProps) => {
			toast.success(Toast, { data: {success: true, ...props} });
		},
	};

	/**
	 * Toast notification container component.
	 * Place this in your component tree to render notifications.
	 */
	const NotificationContainer = () => <ToastContainer {...toastConfig} />;

	return { notify, NotificationContainer };
};
